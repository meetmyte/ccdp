import { Module } from '@nestjs/common';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';

@Module({
  imports: [PatientsModule, DoctorsModule],
})
export class MobileModule {}
