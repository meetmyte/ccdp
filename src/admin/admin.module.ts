import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorModule } from './doctor/doctor.module';

@Module({
  imports: [AuthModule, PatientsModule, DoctorModule],
})
export class AdminModule {}
