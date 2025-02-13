import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: Twilio.Twilio;
  private readonly from: string;

  constructor() {
    this.client = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.from = process.env.TWILIO_PHONE_NUMBER!;
  }

  async sendSms(to: string, message: string): Promise<any> {
    try {
      const response = await this.client.messages.create({
        body: message,
        from: this.from,
        to,
      });
      return response;
    } catch (error) {
      console.error('Error enviando SMS:', error);
      throw error;
    }
  }
}
