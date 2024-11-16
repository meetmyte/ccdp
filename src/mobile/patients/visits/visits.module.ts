import { Module } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { SharedModule } from 'src/shared/shared.module';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from 'src/helpers/jwt.strategy';
import { HelperService } from 'src/helpers/helper.service';

@Module({
  imports: [SharedModule],
  controllers: [VisitsController],
  providers: [VisitsService, JwtService, JwtStrategy, HelperService],
  exports: [VisitsService],
})
export class VisitsModule {}
