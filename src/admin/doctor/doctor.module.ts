import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [DoctorController],
  providers: [DoctorService, UserRepository],
})
export class DoctorModule {}
