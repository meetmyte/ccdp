import { forwardRef, Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { SharedModule } from 'src/shared/shared.module';
import { HelperService } from 'src/helpers/services/helper.service';
import { EmailService } from 'src/helpers/services/email.service';
import { JwtService } from '@nestjs/jwt';
import { TwilioService } from 'src/helpers/services/twillio.service';
import { VisitsService } from 'src/mobile/patients/visits/visits.service';
import { VisitsModule } from 'src/mobile/patients/visits/visits.module';

@Module({
  imports: [SharedModule, forwardRef(() => VisitsModule)],
  controllers: [PatientsController],
  providers: [
    PatientsService,
    UserRepository,
    HelperService,
    EmailService,
    TwilioService,
    JwtService,
    VisitsService,
  ],
})
export class PatientsModule {}
