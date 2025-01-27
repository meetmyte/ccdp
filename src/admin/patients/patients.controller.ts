import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientsService } from './patients.service';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { AdminGuard } from 'src/shared/guards/admin.guard';

@ApiTags('Patients Management')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post('onboard')
  @ApiOperation({ summary: 'Onboard a new patient' })
  @ApiBody({ type: CreatePatientDto })
  @ApiResponse({
    status: 201,
    description: 'Patient successfully onboarded',
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Patient record already exists' })
  onboardPatient(
    @Body() createPatientDto: CreatePatientDto,
  ): Promise<ResponseDto> {
    return this.patientsService.onboardPatient(createPatientDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update patient details' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  updatePatient(
    @Param('id') patientId: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<ResponseDto> {
    return this.patientsService.updatePatient(patientId, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a patient' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  deletePatient(@Param('id') patientId: string): Promise<ResponseDto> {
    return this.patientsService.deletePatient(patientId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users with pagination, filters, and sorting',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'asc' })
  @ApiQuery({ name: 'sortBy', required: false, example: 'first_name' })
  @ApiQuery({
    name: 'filters',
    required: false,
    description: 'Dynamic filter object',
  })
  async getPatients(
    @Query() paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    return this.patientsService.getPatients(paginationFilterDto);
  }

  @Get(':patientId/visits')
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
  ): Promise<any> {
    return await this.patientsService.getVisitsByPatientId(patientId);
  }

  @Get('visits/:visitId/answers')
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
    return this.patientsService.getAnswersByVisitId(visitId);
  }

  @Get('all-visits')
  @ApiOperation({
    summary: 'Get all visits with filters, pagination, and signals',
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    description: 'Search filters as a JSON string (e.g., {"patientId":"123"})',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field (e.g., createdAt)',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (asc/desc)',
    example: 'asc',
  })
  async getAllVisitsWithPagination(
    @Query() paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    return this.patientsService.getAllVisitsWithPagination(paginationFilterDto);
  }

  @Get('signals/chart')
  @ApiOperation({
    summary: 'Retrieve monthly signal data for the chart',
    description:
      'Fetches signal counts (Distress, Sarc-F, G8) for each month of the given year.',
  })
  @ApiQuery({
    name: 'year',
    description: 'Year for which the signal data is requested',
    example: 2023,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Signal data retrieved successfully',
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid year provided' })
  async getSignalDataForChart(
    @Query('year') year: number,
  ): Promise<ResponseDto> {
    if (!year || isNaN(year)) {
      return ResponseDto.badRequest(null, 'Invalid year provided');
    }
    return this.patientsService.getSignalDataForYear(year);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard data',
    description:
      'Fetches total counts of patients, visits, doctors, and unresolved signals for the dashboard.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Dashboard data retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            totalPatients: { type: 'number', example: 1849 },
            totalVisits: { type: 'number', example: 3000 },
            totalDoctors: { type: 'number', example: 24 },
            totalSignals: { type: 'number', example: 740 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve dashboard data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: {
          type: 'string',
          example: 'Failed to retrieve dashboard data',
        },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  async dashboard(): Promise<ResponseDto> {
    return this.patientsService.dashboard();
  }

  //he
}
