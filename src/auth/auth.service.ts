import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as jwt from 'jsonwebtoken';
import * as twilio from 'twilio';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private twilioClient: twilio.Twilio;

  constructor(private usersService: UsersService) {
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  // Enviar código por SMS
  async sendSmsCode(phone: string): Promise<{ success: boolean, code: any }> {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos

    let user = await this.usersService.findByPhone(phone);  
    console.log(code);
    
    if (!user) {
      user = await this.usersService.createUser(phone);
    }

    user!.code = await bcrypt.hash(code, 10); // Guardar código cifrado
    await this.usersService.saveUser(user!);

    // await this.twilioClient.messages.create({
    //   body: `Tu código de verificación es: ${code}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone,
    // });

    return { success: true, code: code };
  }

  // Verificar código y generar tokens
  async verifyCode(phone: string, code: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findByPhone(phone);
    if (!user || !(await bcrypt.compare(code, user.code))) {
      throw new UnauthorizedException('Código inválido');
    }

    const accessToken = jwt.sign({ phone }, process.env.JWT_SECRET!, { expiresIn: '7d' }); // Token de 7 días
    const refreshToken = jwt.sign({ phone }, process.env.JWT_REFRESH_SECRET!);

    return { accessToken, refreshToken };
  }

  // Refrescar token
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
      const accessToken = jwt.sign({ phone: decoded.phone }, process.env.JWT_SECRET!, { expiresIn: '7d' });
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
