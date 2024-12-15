import { forwardRef, Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { SharedModule } from 'src/shared/shared.module';
import { VisitsModule } from '../patients/visits/visits.module';

@Module({
  imports: [SharedModule, forwardRef(() => VisitsModule)],
  controllers: [DoctorsController],
  providers: [DoctorsService],
})
export class DoctorsModule {}
