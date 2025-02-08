import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { FeedbackService } from './feedbacks.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';

@ApiTags('Feedback')
@ApiBearerAuth()
@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit feedback' })
  @ApiBody({ type: CreateFeedbackDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Feedback submitted successfully',
    type: ResponseDto,
  })
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<ResponseDto> {
    return this.feedbackService.createFeedback(createFeedbackDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feedback' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All feedbacks retrieved successfully',
    type: ResponseDto,
  })
  async getAllFeedback(): Promise<ResponseDto> {
    return this.feedbackService.getAllFeedback();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feedback by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Feedback ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback retrieved successfully',
    type: ResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Feedback not found' })
  async getFeedbackById(@Param('id') id: string): Promise<ResponseDto> {
    return this.feedbackService.getFeedbackById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update feedback' })
  @ApiParam({ name: 'id', required: true, description: 'Feedback ID' })
  @ApiBody({ type: UpdateFeedbackDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback updated successfully',
    type: ResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Feedback not found' })
  async updateFeedback(
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<ResponseDto> {
    return this.feedbackService.updateFeedback(id, updateFeedbackDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feedback' })
  @ApiParam({ name: 'id', required: true, description: 'Feedback ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback deleted successfully',
    type: ResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Feedback not found' })
  async deleteFeedback(@Param('id') id: string): Promise<ResponseDto> {
    return this.feedbackService.deleteFeedback(id);
  }
}
