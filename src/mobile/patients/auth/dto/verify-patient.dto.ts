import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class VerifyPatientDto {
  @ApiProperty({
    description: 'First name of the patient',
    example: 'Ahmed',
  })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'First name of the patient',
    example: 'Ahmed',
  })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'Mobile number of the patient',
    example: '+15020039938',
  })
  @IsNotEmpty()
  // @IsMobilePhone() // Validate as a mobile phone number
  mobile_no: number;

  @ApiProperty({
    description: 'Medicare Number',
    example: 'AYVPB1864C',
  })
  @IsNotEmpty()
  @IsString()
  medicare_code: string;

  @ApiProperty({
    description: 'Date of birth of the patient',
    example: '1991-12-17',
  })
  @IsNotEmpty()
  @IsDateString()
  date_of_birth: Date;

  @ApiProperty({
    description: 'Gender of the patient',
    example: 'Male',
  })
  @IsNotEmpty()
  @IsString()
  gender: string;
}
