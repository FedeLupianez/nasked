import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { SessionDTO } from './dto/profile.dto';
import { AccountsService } from '../accounts/accounts.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from './dto/login.dto';
import { verify } from 'argon2';
import { Repository } from 'typeorm';
import { RefreshTokens } from './refreshTokens.entity';
import { createHash } from 'crypto';
import { Payload, Tokens } from './dto/tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly tokensRepo: Repository<RefreshTokens>
  ) { }

  hashToken(token: string): Buffer {
    return createHash('sha256').update(token).digest();
  }

  async generateTokens(payload: Payload): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
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
    const payload: Payload = { sub: newAccount.id_account, email: newAccount.email };
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
    const validPasswd = await verify(account.password, login.password);
    if (!validPasswd)
      throw new UnauthorizedException('Invalid Password');
    const tokens = await this.generateTokens({ sub: account.id_account, email: account.email });
    return {
      email: account.email,
      name: account.name,
      lastname: account.lastname,
      tokens: tokens
    }
  }
}
