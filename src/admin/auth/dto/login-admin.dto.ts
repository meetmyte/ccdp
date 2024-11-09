import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminDto {
  @ApiProperty({
    description: 'Email address of the admin',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the admin account',
    example: 'adminpassword',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
