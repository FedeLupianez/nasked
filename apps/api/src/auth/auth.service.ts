import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { SessionDTO } from './dto/profile.dto';
import { AccountsService } from '../accounts/accounts.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from './dto/login.dto';
import { verify } from 'argon2';
import { createHash } from 'crypto';
import { Payload, Tokens } from './dto/tokens.dto';
import { ConfigService } from '@nestjs/config';
import { Accounts } from '../accounts/accounts.entity';
import { RefreshTokensService } from './refresh-tokens.service';
import { toUuidString } from '../common/uuid';

const REFRESH_EXPIRATION = '7d';
const REFRESH_ISSUER = 'nasked-refresh';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly tokensService: RefreshTokensService
  ) { }

  private get refreshSecret(): string {
    return this.config.get<string>('JWT_REFRESH_SECRET')
      ?? this.config.getOrThrow<string>('JWT_SECRET');
  }

  hashToken(token: string): Buffer {
    return createHash('sha256').update(token).digest();
  }

  /** `id_account` es `binary(16)`; el `sub` del JWT va como UUID string. */
  accountSub(account: Accounts): string {
    return toUuidString(account.id_account);
  }

  async generateTokens(payload: Payload): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: REFRESH_EXPIRATION,
      secret: this.refreshSecret,
      issuer: REFRESH_ISSUER
    });
    await this.tokensService.create({
      tokenHashed: this.hashToken(refreshToken).toString('hex'),
      email: payload.email
    });
    return {
      access: accessToken,
      refresh: refreshToken
    };
  }

  async register(user: RegisterDTO): Promise<SessionDTO> {
    const newAccount = await this.accountService.create(user);
    const payload: Payload = { sub: this.accountSub(newAccount), email: newAccount.email };
    const tokens = await this.generateTokens(payload);
    return {
      email: newAccount.email,
      lastname: newAccount.lastname,
      name: newAccount.name,
      tokens: tokens
    }
  }

  async login(login: LoginDTO): Promise<SessionDTO> {
    const account = await this.accountService.getByEmail(login.email);
    if (!account) throw new NotFoundException('Account not found');
    const validPasswd = await verify(account.password, login.password, { secret: Buffer.from(process.env.ARGON_SECRET) });
    if (!validPasswd)
      throw new UnauthorizedException('Invalid Password');
    const tokens = await this.generateTokens({ sub: this.accountSub(account), email: account.email });
    return {
      email: account.email,
      name: account.name,
      lastname: account.lastname,
      tokens: tokens
    }
  }

  async refresh(token: string): Promise<SessionDTO> {
    let payload: Payload;
    try {
      payload = await this.jwtService.verifyAsync<Payload>(token, {
        secret: this.refreshSecret,
        issuer: REFRESH_ISSUER
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    let stored;
    try {
      stored = await this.tokensService.findByHash(this.hashToken(token), payload.email);
    } catch {
      // Token valido pero ya rotado o revocado.
      throw new UnauthorizedException('Refresh token revoked');
    }
    const account = stored.account;
    // Rotacion: el refresh usado se revoca y se emite uno nuevo.
    await this.tokensService.revoke(stored.tokenHashed, stored.email);
    const tokens = await this.generateTokens(payload);
    return {
      name: account.name,
      lastname: account.lastname,
      email: account.email,
      tokens: tokens
    }
  }

  /** Cierra la sesion del refresh token dado. */
  async logout(token: string): Promise<boolean> {
    let payload: Payload;
    try {
      payload = await this.jwtService.verifyAsync<Payload>(token, {
        secret: this.refreshSecret,
        issuer: REFRESH_ISSUER
      });
    } catch {
      // Un token invalido no es motivo de error en logout: la sesion ya no sirve.
      return false;
    }
    await this.tokensService.revoke(this.hashToken(token), payload.email);
    return true;
  }
}