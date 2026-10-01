import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { SessionDTO } from './dto/profile.dto';
import { AccountsService } from '../accounts/accounts.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from './dto/login.dto';
import { verify } from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokens } from './refreshTokens.entity';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { Payload, Tokens } from './dto/tokens.dto';
import { ConfigService } from '@nestjs/config';
import { stringify } from 'uuid';
import { Accounts } from '../accounts/accounts.entity';

const REFRESH_EXPIRATION = '7d';
const REFRESH_ISSUER = 'nasked-refresh';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshTokens)
    private readonly tokensRepo: Repository<RefreshTokens>
  ) { }

  /**
   * Secreto propio de los refresh tokens. Se separa del de los access tokens
   * para que un access token filtrado no pueda usarse contra /auth/refresh.
   */
  private get refreshSecret(): string {
    return this.config.get<string>('JWT_REFRESH_SECRET')
      ?? this.config.getOrThrow<string>('JWT_SECRET');
  }

  hashToken(token: string): Buffer {
    return createHash('sha256').update(token).digest();
  }

  /**
   * id_account se guarda como binary(16) (uuid v7), el JWT lo lleva como string.
   */
  accountSub(account: Accounts): string {
    return stringify(account.id_account);
  }

  async generateTokens(payload: Payload): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: REFRESH_EXPIRATION,
      secret: this.refreshSecret,
      issuer: REFRESH_ISSUER
    });
    const storedToken = this.tokensRepo.create({
      tokenHashed: this.hashToken(refreshToken),
      email: payload.email
    });
    await this.tokensRepo.save(storedToken);
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
    const stored = await this.tokensRepo.findOne({
      where: { tokenHashed: this.hashToken(token), email: payload.email }, relations: { account: true }
    })
    if (!stored) throw new UnauthorizedException('Refresh token revoked');
    const account = stored.account;
    await this.tokensRepo.remove(stored);
    const tokens = await this.generateTokens(payload);
    return {
      name: account.name,
      lastname: account.lastname,
      email: account.email,
      tokens: tokens
    }
  }
}
