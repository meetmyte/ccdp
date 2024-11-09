import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Mobile number of the patient',
    example: '+15020039938',
  })
  @IsNotEmpty()
  // @IsMobilePhone() // Validates the mobile number
  mobile_no: number;

  @ApiProperty({
    description: 'OTP',
    example: '123123',
  })
  @IsNotEmpty()
  // @IsMobilePhone() // Validates the mobile number
  otp: number;

  @ApiProperty({
    description: 'OTP',
    example: '123123',
  })
  @IsOptional()
  // @IsMobilePhone() // Validates the mobile number
  email: string;
}
