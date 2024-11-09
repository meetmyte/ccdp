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
}
