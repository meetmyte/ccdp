import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Visit, VisitDocument } from '../schemas/visits.schema';

@Injectable()
export class VisitsRepository {
  constructor(
    @InjectModel(Visit.name) private visitModel: Model<VisitDocument>,
  ) {}

  async createVisit(patientId: string): Promise<Visit> {
    const visitId = Math.floor(10000000 + Math.random() * 90000000).toString(); // Unique visit ID
    const visit = new this.visitModel({ patientId, visitId });
    return visit.save();
  }

  async findVisitById(visitId: string): Promise<Visit> {
    return this.visitModel.findOne({ _id: visitId }).exec();
  }
}
