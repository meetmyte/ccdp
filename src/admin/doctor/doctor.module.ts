import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { SharedModule } from 'src/shared/shared.module';
import { EmailService } from 'src/helpers/services/email.service';

@Module({
  imports: [SharedModule],
  controllers: [DoctorController],
  providers: [DoctorService, UserRepository,EmailService],
})
export class DoctorModule {}
