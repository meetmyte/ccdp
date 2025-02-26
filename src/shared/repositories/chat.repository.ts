import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from '../schemas/chat.schema';

@Injectable()
export class ChatRepository {
  constructor(@InjectModel(Chat.name) private chatModel: Model<ChatDocument>) {}

  async saveChat(
    userId: string,
    patientId: string,
    userType: 'doctor' | 'patient',
    message: string,
    response: string,
  ): Promise<Chat> {
    return await new this.chatModel({
      userId,
      patientId,
      userType,
      message,
      response,
    }).save();
  }

  async getChatHistory(patientId: string): Promise<Chat[]> {
    return await this.chatModel
      .find({ patientId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Fetch chat history for a specific patient
  async getPatientChatHistory(patientId: string): Promise<Chat[]> {
    return await this.chatModel
      .find({ patientId, userType: 'patient' })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Fetch chat history for a specific doctor-patient interaction
  async getDoctorChatHistory(
    patientId: string,
    doctorId: string,
  ): Promise<Chat[]> {
    return await this.chatModel
      .find({ patientId, userId: doctorId, userType: 'doctor' })
      .sort({ createdAt: -1 })
      .exec();
  }
}
