import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor(private configService: ConfigService) {
    this.client = twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');
  }

  async sendOtp(to: string, otp: string): Promise<any> {
    try {
      const message = await this.client.messages.create({
        body: `Your verification code is ${otp}`,
        from: this.fromNumber,
        to,
      });
      return message;
    } catch (error) {
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
  }
}
