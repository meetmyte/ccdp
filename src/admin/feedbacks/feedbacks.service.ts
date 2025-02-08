import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackRepository } from 'src/shared/repositories/feedback.repository';

@Injectable()
export class FeedbackService {
  constructor(private readonly feedbackRepository: FeedbackRepository) {}

  async createFeedback(
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<ResponseDto> {
    const feedback =
      await this.feedbackRepository.createFeedback(createFeedbackDto);
    return ResponseDto.success(feedback, 'Feedback submitted successfully');
  }

  async getAllFeedback(): Promise<ResponseDto> {
    const feedbacks = await this.feedbackRepository.findAll();
    return ResponseDto.success(
      feedbacks,
      'All feedbacks retrieved successfully',
    );
  }

  async getFeedbackById(id: string): Promise<ResponseDto> {
    const feedback = await this.feedbackRepository.findById(id);
    if (!feedback) throw new NotFoundException('Feedback not found');
    return ResponseDto.success(feedback, 'Feedback retrieved successfully');
  }

  async updateFeedback(
    id: string,
    updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<ResponseDto> {
    const updatedFeedback = await this.feedbackRepository.updateFeedback(
      id,
      updateFeedbackDto,
    );
    if (!updatedFeedback) throw new NotFoundException('Feedback not found');
    return ResponseDto.success(
      updatedFeedback,
      'Feedback updated successfully',
    );
  }

  async deleteFeedback(id: string): Promise<ResponseDto> {
    await this.feedbackRepository.deleteFeedback(id);
    return ResponseDto.success(null, 'Feedback deleted successfully');
  }
}
