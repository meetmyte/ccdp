// src/visits/visits.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { VisitsService } from './visits.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { PatientGuard } from 'src/shared/guards/patient.guard';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';

@ApiTags('Visits')
@Controller('visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PatientGuard)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Get('questions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all questions' })
  @ApiResponse({
    status: 200,
    description: 'Returns all questions grouped by categories',
    type: ResponseDto,
  })
  async getAllQuestions(): Promise<any> {
    return this.visitsService.getAllQuestions();
  }

  // @Post('plan')
  // @HttpCode(HttpStatus.CREATED)
  // @ApiOperation({ summary: 'Create a new visit for a patient' })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       patientId: {
  //         type: 'string',
  //         description: 'ID of the patient',
  //         example: '613b1d6f5fc13a001e0b4c8d',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Visit created successfully with visit ID',
  //   type: ResponseDto,
  // })
  // async createVisit(
  //   @Body('patientId') patientId: string,
  // ): Promise<ResponseDto> {
  //   return this.visitsService.createVisit(patientId);
  // }

  @Post('plan')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new visit for a patient' })
  @ApiResponse({
    status: 201,
    description: 'Visit created successfully with visit ID',
    type: ResponseDto,
  })
  async createVisit(
    @Request() req, // Access the full request object
  ): Promise<ResponseDto> {
    const patientId = req.user.userId; // Access patientId from req.user
    return this.visitsService.createVisit(patientId);
  }

  @Post(':visitId/answer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Store or update an answer for a question' })
  @ApiParam({
    name: 'visitId',
    required: true,
    description: 'ID of the visit',
    example: '672728ca0febfda4b1df5adf',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categoryId: {
          type: 'string',
          description: 'ID of the question category',
          example: '672728ca0febfda4b1df5adf',
        },
        questionId: {
          type: 'string',
          description: 'ID of the question',
          example: '613b1d6f5fc13a001e0b4c7d',
        },
        answer: {
          type: 'string',
          description: 'Answer to the question',
          example: 'Not feeling well',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Answer stored or updated successfully',
    type: ResponseDto,
  })
  async storeAnswer(
    @Param('visitId') visitId: string,
    @Body('categoryId') categoryId: string,
    @Body('questionId') questionId: string,
    @Body('answer') answer: any,
  ): Promise<ResponseDto> {
    return this.visitsService.storeAnswer(
      visitId,
      categoryId,
      questionId,
      answer,
    );
  }

  @Get('list')
  @ApiOperation({
    summary: 'Get all visits of a patient',
    description:
      'Fetches all visits associated with the authenticated patient.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of visits retrieved successfully',
    schema: {
      example: {
        status: 'success',
        data: [
          {
            visitId: '102934',
            date: 'March 17, 2024; 10:40 AM',
          },
          {
            visitId: '9130',
            date: 'Nov 15, 2023; 10:40 AM',
          },
          {
            visitId: '3948',
            date: 'Nov 01, 2023; 10:40 AM',
          },
        ],
        message: 'Visits retrieved successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No visits found for this patient' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async allVistisOfPatient(@Request() req): Promise<ResponseDto> {
    return this.visitsService.allVistisOfPatient(req.user.userId);
  }

  @Get(':visitId/answers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve answers for a specific visit' })
  @ApiParam({
    name: 'visitId',
    required: true,
    description: 'ID of the visit to retrieve answers for',
    example: '613b1d6f5fc13a001e0b4c8d',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns answers grouped by categories for a visit',
    type: ResponseDto,
  })
  async getAnswers(@Param('visitId') visitId: string): Promise<ResponseDto> {
    return this.visitsService.getAnswersByVisitId(visitId);
  }
}
