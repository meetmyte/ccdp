import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatRequestDto } from './dto/chatbot-request.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { PatientGuard } from 'src/shared/guards/patient.guard';

@ApiTags('Chatbot')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PatientGuard)
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ask a question and get an AI-generated response' })
  @ApiResponse({
    status: 200,
    description: 'Returns the AI-generated answer for the user question',
    type: ResponseDto,
  })
  async askQuestion(
    @Request() req, //
    @Body() chatRequestDto: ChatRequestDto,
  ): Promise<ResponseDto> {
    if (!chatRequestDto.question) {
      throw new BadRequestException('Question is required');
    }

    const patientId = req.user.userId;

    const answer = await this.chatbotService.generateResponse(
      chatRequestDto.question,
      patientId,
    );
    return ResponseDto.success({ answer }, 'Response generated successfully');
  }
}
