// src/visits/visits.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VisitsService } from './visits.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { PatientGuard } from 'src/shared/guards/patient.guard';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';
import { DoctorsService } from 'src/mobile/doctors/doctors.service';

@ApiTags('Visits')
@Controller('visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PatientGuard)
export class VisitsController {
  constructor(
    private readonly visitsService: VisitsService,
    private readonly doctorsService: DoctorsService,
  ) {}

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

  @Post('file/:visitId/answer')
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
        frontImage: {
          type: 'string',
          format: 'binary',
          description: 'Front image for pain points',
        },
        backImage: {
          type: 'string',
          format: 'binary',
          description: 'Back image for pain points',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Answer stored or updated successfully',
    type: ResponseDto,
  })
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: {
        fileSize: 50 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async storeInteractiveAnswer(
    @Param('visitId') visitId: string,
    @Body('categoryId') categoryId: string,
    @Body('questionId') questionId: string,
    @UploadedFiles() files: any[],
  ): Promise<ResponseDto> {
    // Separate files into front and back images
    const frontImage = files.find((file) => file.fieldname === 'frontImage');
    const backImage = files.find((file) => file.fieldname === 'backImage');

    return this.visitsService.storeInteractiveAnswer(
      visitId,
      categoryId,
      questionId,
      frontImage,
      backImage,
    );
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

  @Post(':visitId/answers/multiple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Store or update multiple answers for questions' })
  @ApiParam({
    name: 'visitId',
    required: true,
    description: 'ID of the visit',
    example: '672728ca0febfda4b1df5adf',
  })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
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
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Answers stored or updated successfully',
    type: ResponseDto,
  })
  async storeMultipleAnswers(
    @Param('visitId') visitId: string,
    @Body()
    answers: Array<{ categoryId: string; questionId: string; answer: any }>,
  ): Promise<ResponseDto> {
    return this.visitsService.storeMultipleAnswers(visitId, answers);
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

  @Get(':visitId/profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate AI-generated patient profile based on answers',
  })
  @ApiParam({
    name: 'visitId',
    required: true,
    description: 'ID of the visit to retrieve answers for and generate profile',
    example: '613b1d6f5fc13a001e0b4c8d',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an AI-generated patient profile',
    type: ResponseDto,
  })
  async generateProfile(
    @Param('visitId') visitId: string,
  ): Promise<ResponseDto> {
    return await this.visitsService.generatePatientProfile(visitId);
  }

  @Patch(':visitId/profile')
  @ApiOperation({ summary: 'Update patient profile summary' })
  @ApiParam({
    name: 'visitId',
    required: true,
    description: 'ID of the visit to update profile for',
    example: '613b1d6f5fc13a001e0b4c8d',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          description: 'Updated profile summary data',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Patient profile updated successfully',
    type: ResponseDto,
  })
  async updatePatientProfile(
    @Param('visitId') visitId: string,
    @Body('summary') summary: any,
  ): Promise<ResponseDto> {
    return await this.visitsService.updatePatientProfile(visitId, summary);
  }

  @Get('patient/consultation/list')
  @ApiOperation({
    summary: 'List consultations for the logged-in doctor with filters',
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    description:
      'Search filters as a JSON string (e.g., {"patientId":"123", "visitId":"456"})',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Number of records per page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    example: 'createdAt',
    description: 'Field to sort the records',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    example: 'asc',
    description: 'Sorting order - asc or desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Consultations list retrieved successfully',
    type: ResponseDto,
  })
  async listConsultations(
    @Query() paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    return this.doctorsService.listConsultationsByDoctorId(paginationFilterDto);
  }

  @Post('signal/status/:vistiId')
  @ApiOperation({ summary: 'Update signal status for a visit' })
  @ApiParam({
    name: 'vistiId',
    required: true,
    description: 'ID of the visit to update signal status for',
    example: '613b1d6f5fc13a001e0b4c8d',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isSignalResolved: {
          type: 'boolean',
          description: 'Updated signal status',
        },
        signalComments: {
          type: 'string',
          description: 'It is resolved. patient is under control now.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Signal status updated successfully',
    type: ResponseDto,
  })
  async updateSignalStatus(
    @Param('vistiId') vistiId: string,
    @Body('isSignalResolved') isSignalResolved: boolean,
    @Body('signalComments') signalComments: string,
  ): Promise<ResponseDto> {
    return this.visitsService.updateSignalStatus(
      vistiId,
      isSignalResolved,
      signalComments,
    );
  }
}
