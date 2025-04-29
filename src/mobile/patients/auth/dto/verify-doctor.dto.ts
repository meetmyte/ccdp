import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class VerifyDoctorDto {
  @ApiProperty({
    description: 'First name of the doctor',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'Last name of the doctor',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'Mobile number of the doctor',
    example: '+15020039938',
  })
  @IsNotEmpty()
  mobile_no: string;

  @ApiProperty({
    description: 'Date of birth of the doctor',
    example: '1980-05-20',
  })
  @IsNotEmpty()
  @IsDateString()
  date_of_birth: Date;

  @ApiProperty({
    description: 'Gender of the doctor',
    example: 'Male',
  })
  @IsNotEmpty()
  @IsString()
  gender: string;
}