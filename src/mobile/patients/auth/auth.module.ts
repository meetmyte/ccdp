import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { SharedModule } from 'src/shared/shared.module';
import { EmailService } from 'src/helpers/email.service';
import { JwtModule } from '@nestjs/jwt';
import { TwilioService } from 'src/helpers/twillio.service';

@Module({
  imports: [
    SharedModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // JWT Secret from .env
      signOptions: { expiresIn: '4h' }, // Token expiration
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, EmailService, TwilioService],
})
export class AuthModule {}
