import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [AuthModule, PatientsModule],
})
export class AdminModule {}
