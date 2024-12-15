import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignPatientDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  patientId: string;
}
