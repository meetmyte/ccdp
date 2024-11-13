import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Create a new user
  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  // Find a user by email
  async findByEmail(email: string): Promise<any> {
    return this.userModel.findOne({ email }).exec();
  }

  // Generic method to fetch all users with pagination, filters, and sorting
  async findAll(paginationFilterDto: any): Promise<User[]> {
    const {
      page = 1,
      limit = 10,
      sortOrder = 'asc',
      sortBy = 'createdAt',
      filters = {},
    } = paginationFilterDto;

    // Create the query object using dynamic filters
    const query: any = {};

    Object.keys(filters).forEach((key) => {
      // Use regex for string fields to make searches case-insensitive
      if (typeof filters[key] === 'string') {
        query[key] = { $regex: filters[key], $options: 'i' };
      } else {
        query[key] = filters[key];
      }
    });

    // Execute the query with pagination and sorting
    const users = await this.userModel
      .find(query)
      .skip((page - 1) * limit) // Pagination: Skip previous records
      .limit(limit) // Pagination: Limit the results
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 }) // Sorting by field
      .exec();

    return users;
  }

  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  // Update a user by id
  async updateById(
    userId: string,
    updateData: Partial<User>,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
  }

  // Delete a user by id
  async deleteById(userId: string): Promise<void> {
    await this.userModel.findByIdAndDelete(userId).exec();
  }

  // Find a user by hospital code
  async findByHospitalCode(hospital_code: string): Promise<any> {
    return this.userModel
      .findOne({ hospital_code })
      .select(
        '_id first_name last_name mobile_no date_of_birth gender medicare_code',
      ) // Specify the fields you want
      .exec();
  }

  async findInactiveMobile(mobile_no, is_active = true) {
    return await this.userModel.findOne({ mobile_no });
  }

  async findByMobileOrEmail(
    mobile_no: number,
    email: string,
  ): Promise<User | null> {
    return this.userModel.findOne({
      $or: [{ mobile_no }, { email }],
      is_active: true,
    });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.userModel.findOne({
      $or: [{ mobile_no: identifier }, { email: identifier }],
      is_active: true,
    });
  }
}
