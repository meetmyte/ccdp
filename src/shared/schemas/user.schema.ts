// src/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { USER_TYPE } from 'src/helpers/enums';
import * as mongooseFieldEncryption from 'mongoose-field-encryption';
import * as dotEnv from 'dotenv';
dotEnv.config();

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, default: null })
  password: string;

  @Prop({ default: USER_TYPE.PATIENT, required: true })
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

// 2) Use the plugin on the schema
UserSchema.plugin(mongooseFieldEncryption.fieldEncryption, {
  // List all the fields you want to encrypt:
  fields: [
    'first_name',
    'last_name',
    'password',
    'medicare_code',
    'mobile_no',
    'date_of_birth',
    'otp',
    'login_otp',
  ],

  // Use a secret key from your .env (DON'T hardcode in real apps)
  secret: process.env.ENCRYPTION_KEY || 'HCEnRyptionKey@123!@#&&^8',

  // Optionally, define a custom salt generator if needed.
  // If you omit it, the plugin generates one automatically.
  // saltGenerator: (secret) => {
  //   // Must return a 16-byte buffer/string
  //   return '1234567890123456';
  // }
});
UserSchema.set('toJSON', { getters: true });
UserSchema.set('toObject', { getters: true });
