import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDTO } from './auth.dto';
import { AccountsService } from '../accounts/accounts.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly accountService: AccountsService
  ) { }

  @Post('register')
  async register(@Body() body: RegisterDTO) {
    return await this.accountService.create(body);
  }
}
