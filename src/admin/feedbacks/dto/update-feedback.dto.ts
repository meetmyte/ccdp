import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateFeedbackDto {
  @ApiProperty({
    example: true,
    description: 'Mark feedback as resolved or not',
  })
  @IsBoolean()
  isResolved: boolean;
}
