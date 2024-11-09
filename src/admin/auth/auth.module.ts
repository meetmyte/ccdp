import { Module } from '@nestjs/common';
import { AdminAuthController } from './auth.controller';
import { AdminAuthService } from './auth.service';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { SharedModule } from 'src/shared/shared.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SharedModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // JWT Secret from .env
      signOptions: { expiresIn: '4h' }, // Token expiration
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, UserRepository],
})
export class AuthModule {}
