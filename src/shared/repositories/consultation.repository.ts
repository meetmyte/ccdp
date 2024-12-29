import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Consultation,
  ConsultationDocument,
} from '../schemas/consultations.schema';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';

@Injectable()
export class ConsultationRepository {
  constructor(
    @InjectModel(Consultation.name)
    private consultationModel: Model<ConsultationDocument>,
  ) {}

  async getTable() {
    return await this.consultationModel;
  }

  async getTotalCounts(doctorId: string) {
    return await this.consultationModel
      .countDocuments({ doctorId: new Types.ObjectId(doctorId) })
      .lean();
  }

  async getTodayTotalCounts(doctorId: string) {
    const now = new Date();
    const startOfToday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
      ),
    );
    const endOfToday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    console.log('Start of Today (UTC):', startOfToday);
    console.log('End of Today (UTC):', endOfToday);
    return await this.consultationModel
      .countDocuments({
        doctorId: new Types.ObjectId(doctorId),
        createdAt: {
          $gte: startOfToday, // Start of today
          $lt: endOfToday, // End of today
        },
      })
      .lean();
  }

  async createConsultation(data: Partial<Consultation>): Promise<Consultation> {
    const consultation = new this.consultationModel(data);
    return consultation.save();
  }

  async findConsultationsByDoctorId(
    doctorId: string,
    paginationFilterDto: PaginationFilterDto,
  ): Promise<{ consultations: Consultation[]; totalCount: number }> {
    const {
      page = 1,
      limit = 10,
      filters,
      sortBy = 'consultationDate',
      sortOrder = 'asc',
    } = paginationFilterDto;

    const parsedFilters = filters ? JSON.parse(filters) : {};

    // here i need to check that if the parsed filter has the patientId then need to convert it into the objectid
    if (parsedFilters.patientId) {
      parsedFilters.patientId = new Types.ObjectId(parsedFilters.patientId);
    }

    const query = {
      doctorId: new Types.ObjectId(doctorId),
      ...parsedFilters,
    };

    const consultations = await this.consultationModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .exec();

    const totalCount = await this.consultationModel.countDocuments(query);

    return { consultations, totalCount };
  }

  async findConsultationById(
    consultationId: string,
  ): Promise<Consultation | null> {
    return this.consultationModel.findById(consultationId).exec();
  }

  async updateConsultation(
    consultationId: string,
    updateData: Partial<Consultation>,
  ): Promise<Consultation | null> {
    return this.consultationModel
      .findByIdAndUpdate(consultationId, updateData, { new: true })
      .exec();
  }

  async deleteConsultation(consultationId: string): Promise<void> {
    await this.consultationModel.findByIdAndDelete(consultationId).exec();
  }
}
