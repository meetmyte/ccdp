import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConsultationDto {
  @ApiProperty({
    description: 'Patient ID',
    example: '647f1d6eb9b123456789abcd',
  })
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @ApiProperty({
    description: 'Doctor ID',
    example: '647f1d6eb9b123456789abcd',
  })
  @IsNotEmpty()
  @IsString()
  doctorId: string;

  @ApiProperty({ description: 'Visit ID', example: '647f1d6eb9b123456789abcd' })
  @IsNotEmpty()
  @IsString()
  visitId: string;

  @ApiProperty({
    description: 'Consultation Summary',
    example: 'Patient is recovering well.',
  })
  @IsOptional()
  @IsString()
  consultationSummary?: string;

  @ApiProperty({
    description: 'Consultation conversation',
    example: 'You are now on the recovering phase.',
  })
  @IsOptional()
  @IsString()
  conversation?: string;

  @ApiProperty({
    description: 'Consultation Date',
    example: '2024-12-01T10:00:00.000Z',
  })
  @IsOptional()
  consultationDate?: Date;
}
