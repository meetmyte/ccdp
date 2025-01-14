import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visit, VisitDocument } from '../schemas/visits.schema';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';

@Injectable()
export class VisitsRepository {
  constructor(
    @InjectModel(Visit.name) private visitModel: Model<VisitDocument>,
  ) {}

  getTable() {
    return this.visitModel;
  }

  async createVisit(patientId: string): Promise<Visit> {
    const visitId = Math.floor(10000000 + Math.random() * 90000000).toString(); // Unique visit ID
    const visit = new this.visitModel({ patientId, visitId });
    return visit.save();
  }

  async findVisitById(visitId: string): Promise<Visit> {
    return this.visitModel.findOne({ _id: visitId }).exec();
  }

  async findVisitByUserId(usreId: string): Promise<Visit[]> {
    return this.visitModel.find({ patientId: usreId }).exec();
  }

  async updateVisit(
    visitId: string,
    updateData: Partial<Visit>,
  ): Promise<Visit | null> {
    return await this.visitModel
      .findByIdAndUpdate(visitId, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  async getAllVisitsWithPagination(
    paginationFilterDto: PaginationFilterDto,
  ): Promise<any> {
    const {
      filters,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'asc',
    } = paginationFilterDto;

    const skip = (page - 1) * limit;

    // Parse filters
    const queryFilters: any = {};
    if (filters) {
      Object.assign(queryFilters, JSON.parse(filters));
    }

    // Total count of records
    const totalCount = await this.visitModel.countDocuments(queryFilters);

    // Fetch paginated visits
    const visits = await this.visitModel
      .find(queryFilters)
      .populate({
        path: 'patientId',
        model: 'User',
        select: 'first_name last_name email', // Select only necessary fields for `categoryId`
      })
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!visits || visits.length === 0) {
      return { visits, totalCount };
    }

    return { visits, totalCount };
  }

  async getVisitsByMonth(startDate, endDate) {
    const visits = await this.visitModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    return visits;
  }
}
