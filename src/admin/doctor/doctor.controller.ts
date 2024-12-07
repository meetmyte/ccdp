import {
  Body,
  Controller,
  Post,
  Put,
  Delete,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';

@ApiTags('Doctors')
@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiBody({ type: CreateDoctorDto })
  @ApiResponse({
    status: 201,
    description: 'The doctor has been successfully created.',
    type: CreateDoctorDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async addDoctor(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.addDoctor(createDoctorDto);
  }

  @Put(':doctorId')
  @ApiOperation({ summary: 'Update a doctor by ID' })
  @ApiBody({ type: UpdateDoctorDto })
  @ApiResponse({
    status: 200,
    description: 'The doctor has been successfully updated.',
    type: UpdateDoctorDto,
  })
  @ApiResponse({ status: 404, description: 'Doctor not found.' })
  async editDoctor(
    @Param('doctorId') doctorId: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorService.editDoctor(doctorId, updateDoctorDto);
  }

  @Delete(':doctorId')
  @ApiOperation({ summary: 'Remove a doctor by ID' })
  @ApiResponse({
    status: 200,
    description: 'The doctor has been successfully removed.',
  })
  @ApiResponse({ status: 404, description: 'Doctor not found.' })
  async removeDoctor(@Param('doctorId') doctorId: string) {
    return this.doctorService.deleteDoctor(doctorId);
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
  async list(
    @Query() paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    return this.doctorService.list(paginationFilterDto);
  }
}
