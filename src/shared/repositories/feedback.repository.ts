import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument } from '../schemas/feedback.schema';

@Injectable()
export class FeedbackRepository {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) {}

  async createFeedback(feedbackData: any): Promise<Feedback> {
    return await new this.feedbackModel(feedbackData).save();
  }

  async findAll(): Promise<Feedback[]> {
    return await this.feedbackModel.find().populate('userId').exec();
  }

  async findById(id: string): Promise<Feedback | null> {
    return await this.feedbackModel.findById(id).populate('userId').exec();
  }

  async updateFeedback(
    id: string,
    updateData: Partial<Feedback>,
  ): Promise<Feedback | null> {
    return await this.feedbackModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteFeedback(id: string): Promise<void> {
    await this.feedbackModel.findByIdAndDelete(id).exec();
  }
}
