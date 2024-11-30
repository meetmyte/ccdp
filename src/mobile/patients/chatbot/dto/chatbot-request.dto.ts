import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({
    description: 'The question the user wants to ask the chatbot',
    example: 'What are the early symptoms of lung cancer?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;
}
