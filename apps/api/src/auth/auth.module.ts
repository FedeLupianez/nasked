import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountsModule } from '../accounts/accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokens } from './refreshTokens.entity';
import { RefreshTokensService } from './refresh-tokens.service';

@Module({
  controllers: [AuthController],
  imports: [
    AccountsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET') ?? config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
    TypeOrmModule.forFeature([RefreshTokens])
  ],
  providers: [AuthService, RefreshTokensService],
  exports: [AuthService, RefreshTokensService]
})
export class AuthModule { }
