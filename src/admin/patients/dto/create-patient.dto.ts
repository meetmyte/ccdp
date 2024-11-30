import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({
    description: 'First name of the patient',
    example: 'John',
  })
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'Last name of the patient',
    example: 'Doe',
  })
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    description: 'Email of the admin',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty()
  @IsNotEmpty()
  medicare_code: string;

  @ApiProperty()
  @IsNotEmpty()
  gender: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  date_of_birth: string;
}
