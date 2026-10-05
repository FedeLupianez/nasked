import { Controller, Post, Res } from '@nestjs/common';
import { PublicSession } from '../auth/dto/profile.dto';
import { registerCompanyDTO } from './dto/create.dto';
import { CompaniesService } from './companies.service';
import { AuthService } from '../auth/auth.service';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companyService: CompaniesService,
    private readonly authService: AuthService
  ) { }

  @Post('register')
  async registerCompany(register: registerCompanyDTO, @Res({ passthrough: true }) res): Promise<PublicSession> {
    await this.companyService.create(register.company);
    const session = await this.authService.register(register.user);
    return {
      name: session.name,
      lastname: session.lastname,
      email: session.email,
      access: session.tokens.access
    }
  }

}
