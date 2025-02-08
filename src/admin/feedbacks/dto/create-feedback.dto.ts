import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({
    example: '647f1d6eb9b123456789abcd',
    description: 'User ID submitting the feedback',
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({
    example: 'patient',
    enum: ['patient', 'doctor'],
    description: 'User type',
  })
  @IsString()
  @IsIn(['patient', 'doctor'])
  userType: string;

  @ApiProperty({
    example: 'Great experience!',
    description: 'Feedback message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 5, description: 'Rating (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
