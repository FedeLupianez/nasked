import { Body, Controller, Post, Res } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { AuthService } from './auth.service';
import { PublicSession } from './dto/profile.dto';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Post('register')
  async register(@Body() body: RegisterDTO, @Res() res): Promise<PublicSession> {
    const session = await this.authService.register(body);
    res.cookie('refresh_token', session.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
    });
    return {
      name: session.name,
      lastname: session.lastname,
      email: session.email,
      accessToken: session.accessToken
    }
  }
}
