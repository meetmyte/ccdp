import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { SharedModule } from 'src/shared/shared.module';
import { HelperService } from 'src/helpers/helper.service';
import { EmailService } from 'src/helpers/email.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [SharedModule],
  controllers: [PatientsController],
  providers: [
    PatientsService,
    UserRepository,
    HelperService,
    EmailService,
    JwtService,
  ],
})
export class PatientsModule {}
