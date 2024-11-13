// src/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { USER_TYPE } from 'src/helpers/enums';
import * as dotEnv from 'dotenv';
dotEnv.config();

export type UserDocument = User & Document;

@Schema({ timestamps: true }) // Add timestamps for createdAt and updatedAt
export class User {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, default: null })
  password: string;

  @Prop({ default: USER_TYPE.PATIENT, required: true }) // Default role is 'patient'
  role: number;

  @Prop({ default: false })
  is_active: boolean;

  @Prop({ default: false })
  is_invited: boolean;

  @Prop({ default: null })
  otp: number;

  @Prop({ default: null })
  login_otp: number;

  @Prop({ default: null, required: false })
  medicare_code: string;

  @Prop({ default: null, required: false })
  hospital_code: string;

  @Prop({ default: null })
  mobile_no: number;

  @Prop({ required: false, default: null })
  gender: string;

  @Prop({ required: false, default: null })
  date_of_birth: Date;

  @Prop({ default: false })
  is_mobile_verified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
