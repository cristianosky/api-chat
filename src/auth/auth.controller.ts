import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-code')
  async sendCode(@Body('phone') phone: string) {
    return this.authService.sendSmsCode(phone);
  }

  @Post('verify-code')
  async verifyCode(@Body('phone') phone: string, @Body('code') code: string) {
    return this.authService.verifyCode(phone, code);
  }

  @Post('refresh-token')
  async refreshToken(@Body('token') token: string) {
    return this.authService.refreshToken(token);
  }
}
