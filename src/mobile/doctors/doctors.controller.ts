import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Query,
  Delete,
  Param,
  Patch,
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
} from '@nestjs/swagger';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';

@ApiTags('Doctors (Mobile)')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard, DoctorGuard)
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

  @Get('consultation/list')
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
    @Request() req,
    @Query() paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    const doctorId = req.user.userId; // Assuming doctor ID comes from the token
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
}
