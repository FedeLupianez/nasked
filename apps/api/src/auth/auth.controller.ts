import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { AuthService } from './auth.service';
import { PublicSession } from './dto/profile.dto';
import { LoginDTO } from './dto/login.dto';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }
  cookie_name: string = 'nasked_refresh_token';
  cookie_setting = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/auth/refresh',
  }

  @Post('register')
  async register(@Body() body: RegisterDTO, @Res({ passthrough: true }) res): Promise<PublicSession> {
    const session = await this.authService.register(body);
    res.cookie(this.cookie_name, session.tokens.refresh, this.cookie_setting);
    return {
      name: session.name,
      lastname: session.lastname,
      email: session.email,
      access: session.tokens.access
    }
  }

  @Post('login')
  async login(@Body() body: LoginDTO, @Res({ passthrough: true }) res): Promise<PublicSession> {
    const session = await this.authService.login(body);
    res.cookie(this.cookie_name, session.tokens.refresh, this.cookie_setting);
    return {
      name: session.name,
      lastname: session.lastname,
      email: session.email,
      access: session.tokens.access
    }
  }

  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res): Promise<PublicSession> {
    const refreshToken = req.cookies[this.cookie_name];
    const session = await this.authService.refresh(refreshToken);
    res.cookie(this.cookie_name, session.tokens.refresh, this.cookie_setting);
    return {
      name: session.name,
      lastname: session.lastname,
      email: session.email,
      access: session.tokens.access
    }
  }
}
