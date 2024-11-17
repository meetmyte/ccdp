import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure the SMTP transporter using process.env directly
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT, // Ensure the port is a number
      secure: process.env.SMTP_SECURE === 'true', // Convert to boolean if it's a string
      auth: {
        user: process.env.SMTP_USER, // SMTP username
        pass: process.env.SMTP_PASS, // SMTP password
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const from = process.env.SMTP_FROM; // Sender's email address from environment variables
    await this.transporter.sendMail({
      from, // Sender's email address
      to, // Recipient's email address
      subject, // Email subject
      html, // HTML content of the email
    });
  }
}
