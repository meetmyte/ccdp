import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DoctorPatientAssignment,
  DoctorPatientAssignmentDocument,
} from '../schemas/doctor-patients-assignments.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class DoctorPatientAssignmentRepository {
  constructor(
    @InjectModel(DoctorPatientAssignment.name)
    private readonly assignmentModel: Model<DoctorPatientAssignmentDocument>,
  ) {}

  async getTable() {
    return this.assignmentModel;
  }

  async findOne(query: any): Promise<DoctorPatientAssignmentDocument | null> {
    return this.assignmentModel.findOne(query).exec();
  }

  async create(data: any): Promise<DoctorPatientAssignmentDocument> {
    const assignment = new this.assignmentModel(data);
    return assignment.save();
  }

  async findByDoctorId(doctorId: string): Promise<any> {
    return await this.assignmentModel
      .find({ doctorId: new Types.ObjectId(doctorId) })
      .exec();
  }

  //   async getAssignedPatientsWithPagination(
  //     doctorId: string,
  //     filters: any,
  //     page: number = 1,
  //     limit: number = 10,
  //     sortBy: string = 'createdAt',
  //     sortOrder: 'asc' | 'desc' = 'asc',
  //   ): Promise<{ patients: any[]; totalCount: number }> {
  //     const skip = (page - 1) * limit;

  //     const matchFilters = { doctor_id: doctorId, ...filters };

  //     const [result] = await this.assignmentModel.aggregate([
  //       { $match: matchFilters },
  //       {
  //         $lookup: {
  //           from: 'users',
  //           localField: 'patient_id',
  //           foreignField: '_id',
  //           as: 'patient',
  //         },
  //       },
  //       { $unwind: '$patient' },
  //       {
  //         $sort: {
  //           [sortBy]: sortOrder === 'asc' ? 1 : -1,
  //         },
  //       },
  //       {
  //         $facet: {
  //           patients: [{ $skip: skip }, { $limit: limit }],
  //           totalCount: [{ $count: 'count' }],
  //         },
  //       },
  //     ]);

  //     const patients = result.patients || [];
  //     const totalCount = result.totalCount[0]?.count || 0;

  //     return { patients, totalCount };
  //   }

  //   async getAssignedPatientsWithPagination(
  //     doctorId: string,
  //     filters: any,
  //     page: number = 1,
  //     limit: number = 10,
  //     sortBy: string = 'createdAt',
  //     sortOrder: 'asc' | 'desc' = 'asc',
  //   ): Promise<{ patients: any[]; totalCount: number }> {
  //     const skip = (page - 1) * limit;

  //     // Convert doctorId to ObjectId if needed
  //     const queryFilters: any = { doctorId: doctorId };
  //     if (Types.ObjectId.isValid(doctorId)) {
  //       queryFilters.doctorId = new Types.ObjectId(doctorId);
  //     }

  //     // Parse and add other filters if present
  //     if (filters) {
  //       Object.keys(filters).forEach((key) => {
  //         queryFilters[`patient.${key}`] = filters[key];
  //       });
  //     }

  //     // Total count of records
  //     const totalCount = await this.assignmentModel.countDocuments(queryFilters);

  //     // Fetch paginated records with populate
  //     const patients = await this.assignmentModel
  //       .find(queryFilters)
  //       .populate({
  //         path: 'patientId',
  //         model: User.name, // Assuming User is the name of your model
  //         select: 'first_name last_name email mobile_no',
  //       })
  //       .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
  //       .skip(skip)
  //       .limit(limit)
  //       .lean(); // Use lean() for faster performance

  //     return {
  //       patients,
  //       totalCount,
  //     };
  //   }

  async getAssignedPatientsWithPagination(
    doctorId: string,
    filters: any,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ patients: any[]; totalCount: number }> {
    const skip = (page - 1) * limit;

    // Debugging log: Check what doctorId is being passed
    console.log('DoctorId before conversion:', doctorId);

    // Ensure doctorId is a valid ObjectId
    if (!Types.ObjectId.isValid(doctorId)) {
      throw new Error('Invalid doctorId');
    }
    const queryFilters: any = { doctorId: new Types.ObjectId(doctorId) };

    // Parse additional filters if provided
    if (filters) {
      Object.keys(filters).forEach((key) => {
        queryFilters[`patientId.${key}`] = filters[key]; // Filtering on patient fields
      });
    }

    // Debugging log: Log the final query filters
    console.log('Query Filters:', queryFilters);

    try {
      // Get the total count of records
      const totalCount =
        await this.assignmentModel.countDocuments(queryFilters);

      // Fetch paginated records with populate
      const patients = await this.assignmentModel
        .find(queryFilters)
        .populate({
          path: 'patientId',
          model: User.name, // Reference to the User model
          select: 'first_name last_name email mobile_no gender medicare_code',
        })
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(); // Use lean() for performance optimization

      // Debugging log: Check retrieved records
      console.log('Fetched Patients:', patients);

      return {
        patients,
        totalCount,
      };
    } catch (error) {
      console.error('Error fetching assigned patients:', error.message);
      throw error;
    }
  }
}
