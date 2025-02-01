import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateDoctorDto {
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
  gender: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  date_of_birth: Date;
}
