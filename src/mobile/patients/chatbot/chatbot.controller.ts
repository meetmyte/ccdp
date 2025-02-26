import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  BadRequestException,
  UseGuards,
  Request,
  Param,
  UseInterceptors,
  UploadedFile,
  Delete,
  Query,
  Get,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatRequestDto } from './dto/chatbot-request.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { PatientGuard } from 'src/shared/guards/patient.guard';
import { DoctorGuard } from 'src/shared/guards/doctor.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Chatbot')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post("upload-audio")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Upload a single audio chunk for transcription" })
  async uploadAudio(
    @Request() req,
    @Body() body: { audio: string; sessionId: string; chunkId: string }
  ): Promise<ResponseDto> {
    if (!body.audio) {
      throw new BadRequestException("No audio data provided");
    }
  
    const { sessionId, chunkId } = body;
    if (!sessionId || !chunkId) {
      throw new BadRequestException("Missing sessionId or chunkId");
    }
    console.log('test')
    await this.chatbotService.uploadAudioBase64(body, sessionId, chunkId);
    return ResponseDto.success({ sessionId, chunkId }, "Audio chunk received successfully");
  }
  
  
  @Get("transcribe")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Transcribe a specific audio chunk" })
  @ApiQuery({
    name: "sessionId",
    required: true,
    description: "Session ID of the uploaded audio",
  })
  @ApiQuery({
    name: "chunkId",
    required: true,
    description: "Chunk ID to transcribe",
  })
  async transcribeAudio(@Query("sessionId") sessionId: string, @Query("chunkId") chunkId: string) {
    if (!sessionId || !chunkId) {
      throw new BadRequestException("Missing sessionId or chunkId");
    }
    
    const transcript = await this.chatbotService.transcribeChunk(sessionId, chunkId);
    console.log(`Transcript for ${sessionId}/${chunkId}:`, transcript);
  
    return ResponseDto.success({ transcript }, "Transcription completed");
  }
    
  @Delete('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete temporary audio file' })
  @ApiQuery({
    name: 'sessionId',
    required: true,
    description: 'Session ID of the uploaded audio',
  })
  async cleanupAudio(@Query('sessionId') sessionId: string) {
    if (!sessionId) {
      throw new BadRequestException('Missing sessionId');
    }
    await this.chatbotService.cleanupAudio(sessionId);
    return ResponseDto.success(null, 'Temporary audio file deleted');
  }

  @UseGuards(PatientGuard)
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

  @UseGuards(DoctorGuard)
  @Post('ask-doctor')
  @ApiOperation({
    summary: 'Ask a medical question about a specific patient',
    description: 'Allows a doctor to ask questions based on a patient’s data.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          example: "What could be causing the patient's dizziness?",
          description: 'The medical question the doctor wants to ask.',
        },
        patientId: {
          type: 'string',
          example: '647f1d6eb9b123456789abcd',
          description: 'The ID of the patient the question is about.',
        },
      },
      required: ['question', 'patientId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Response generated successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Response generated successfully' },
        data: {
          type: 'object',
          properties: {
            answer: {
              type: 'string',
              example:
                "The patient's dizziness might be caused by dehydration. Recommend increasing hydration and monitoring symptoms.",
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request, missing required fields',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Question and Patient ID are required',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async askDoctor(
    @Body('question') question: string,
    @Body('patientId') patientId: string,
  ): Promise<any> {
    if (!question || !patientId) {
      throw new BadRequestException('Question and Patient ID are required');
    }

    const answer = await this.chatbotService.generateDoctorResponse(
      question,
      patientId,
    );
    return {
      statusCode: 200,
      message: 'Response generated successfully',
      data: { answer },
    };
  }
}
