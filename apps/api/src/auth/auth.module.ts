import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  controllers: [AuthController],
  imports: [AccountsModule],
  providers: [AuthService]
})
export class AuthModule { }
