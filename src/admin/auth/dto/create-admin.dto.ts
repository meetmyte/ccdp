import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({
    description: 'First name of the admin',
    example: 'John',
  })
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'Last name of the admin',
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

  @ApiProperty({
    description: 'Password for the admin account',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
