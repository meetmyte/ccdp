import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({
    description: 'Mobile number of the patient',
    example: '+15020039938',
  })
  @IsNotEmpty()
  // @IsMobilePhone() // Validates the mobile number
  mobile_no: number;
}
