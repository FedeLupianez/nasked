import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { AccountsService } from '../accounts/accounts.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { repositoryProvider } from '../../tests/testing-utils';
import { RefreshTokens } from './refreshTokens.entity';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        RefreshTokensService,
        repositoryProvider(RefreshTokens),
        { provide: AccountsService, useValue: { create: vi.fn(), getByEmail: vi.fn() } },
        { provide: JwtService, useValue: { signAsync: vi.fn(), verifyAsync: vi.fn() } },
        {
          provide: ConfigService,
          useValue: { get: vi.fn(), getOrThrow: vi.fn(() => 'secret') }
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
