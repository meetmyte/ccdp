import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Identifier',
    example: 'email OR mobile',
  })
  @IsNotEmpty()
  @IsString()
  identifier: string; // This can be either mobile number or email

  @IsOptional()
  @IsNumberString()
  otp: string;
}
