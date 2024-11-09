import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { VisitsModule } from './visits/visits.module';

@Module({
  imports: [AuthModule, VisitsModule],
})
export class PatientsModule {}
