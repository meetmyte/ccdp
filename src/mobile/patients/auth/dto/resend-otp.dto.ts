import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({
    description: 'Identifier',
    example: 'email OR mobile',
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;
}
