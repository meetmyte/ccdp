import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Delete,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { AssignPatientDto } from './dto/assign-patient.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { DoctorGuard } from 'src/shared/guards/doctor.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';

@ApiTags('Doctors (Mobile)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, DoctorGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post('assign-patient/:doctorId')
  @ApiOperation({ summary: 'Assign a patient to a doctor' })
  @ApiParam({
    name: 'doctorId',
    type: 'string',
    required: true,
    description:
      'The ID of the doctor whose assigned patients are being listed.',
    example: '647f1d6eb9b123456789abcd',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient assigned to doctor successfully',
    type: ResponseDto,
  })
  async assignPatient(
    @Param('doctorId') doctorId: string,
    @Body() assignPatientDto: AssignPatientDto,
  ): Promise<ResponseDto> {
    return this.doctorsService.assignPatientToDoctor(
      assignPatientDto,
      doctorId,
    );
  }

  @Get('assigned-patients/:doctorId')
  @ApiOperation({
    summary: 'List assigned patients with filters, sorting, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of assigned patients retrieved successfully',
    type: ResponseDto,
  })
  @ApiParam({
    name: 'doctorId',
    type: 'string',
    required: true,
    description:
      'The ID of the doctor whose assigned patients are being listed.',
    example: '647f1d6eb9b123456789abcd',
  })
  async listAssignedPatients(
    @Param('doctorId') doctorId: string,
    @Query() paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    return this.doctorsService.listAssignedPatients(
      doctorId,
      paginationFilterDto,
    );
  }

  @Post('consultation/add')
  @ApiOperation({ summary: 'Add a new consultation' })
  @ApiResponse({
    status: 201,
    description: 'Consultation added successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  async addConsultation(
    @Body() createConsultationDto: CreateConsultationDto,
  ): Promise<ResponseDto> {
    return this.doctorsService.addConsultation(createConsultationDto);
  }

  @Get('consultation/list/:doctorId')
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
  @ApiParam({
    name: 'doctorId',
    type: 'string',
    required: true,
    description:
      'The ID of the doctor whose assigned patients are being listed.',
    example: '647f1d6eb9b123456789abcd',
  })
  async listConsultations(
    @Param('doctorId') doctorId: string,
    @Query() paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    return this.doctorsService.listConsultationsByDoctorId(
      doctorId,
      paginationFilterDto,
    );
  }

  @Patch(':consultationId')
  @ApiOperation({ summary: 'Edit an existing consultation' })
  @ApiParam({
    name: 'consultationId',
    description: 'Unique ID of the consultation to update',
    example: '675d2280fe385543df27457a',
  })
  @ApiResponse({
    status: 200,
    description: 'Consultation updated successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Consultation not found',
  })
  async editConsultation(
    @Param('consultationId') consultationId: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
  ): Promise<ResponseDto> {
    return this.doctorsService.updateConsultation(
      consultationId,
      updateConsultationDto,
    );
  }

  @Delete(':consultationId')
  @ApiOperation({ summary: 'Delete a consultation by its ID' })
  @ApiParam({
    name: 'consultationId',
    description: 'Unique ID of the consultation to delete',
    example: '675d2280fe385543df27457a',
  })
  @ApiResponse({
    status: 200,
    description: 'Consultation deleted successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Consultation not found',
  })
  async deleteConsultation(
    @Param('consultationId') consultationId: string,
  ): Promise<ResponseDto> {
    return this.doctorsService.deleteConsultation(consultationId);
  }

  @Get(':doctorId/:patientId/visits')
  @ApiOperation({
    summary: 'Get visits list for a specific patient by patient ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Visits list retrieved successfully',
    type: ResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found or no visits' })
  async getVisitsByPatientId(
    @Param('patientId') patientId: string,
    @Param('doctorId') doctorId: string,
  ): Promise<any> {
    return await this.doctorsService.getVisitsByPatientId(doctorId, patientId);
  }

  @Get('visit/:visitId/answers')
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
    return this.doctorsService.getAnswersByVisitId(visitId);
  }

  @Get('dashboard/:doctorId')
  @ApiOperation({ summary: 'Get doctor dashboard metrics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard metrics retrieved successfully.',
    type: ResponseDto,
  })
  async getDashboard(
    @Param('doctorId') doctorId: string,
  ): Promise<ResponseDto> {
    return this.doctorsService.getDashboardMetrics(doctorId);
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
    return this.doctorsService.storeAnswer(
      visitId,
      categoryId,
      questionId,
      answer,
    );
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
    return await this.doctorsService.generatePatientProfile(visitId);
  }
}
