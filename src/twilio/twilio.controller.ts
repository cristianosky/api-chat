import { Controller, Post, Body } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Controller('sms')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('send')
  async sendSms(@Body('to') to: string, @Body('message') message: string) {
    return this.twilioService.sendSms(to, message);
  }
}
