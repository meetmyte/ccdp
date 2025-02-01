// src/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { USER_TYPE } from 'src/helpers/enums';
import * as dotEnv from 'dotenv';
import * as crypto from 'crypto';
import { generateHash } from 'src/helpers/hash';
dotEnv.config();

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, set: encryptField, get: decryptField })
  first_name: string;

  @Prop({ required: true, set: encryptField, get: decryptField })
  last_name: string;

  @Prop({ required: true, unique: true, set: encryptField, get: decryptField })
  email: string;

  @Prop({ required: false, unique: true, set: encryptField, get: decryptField })
  mobile_no: string;

  @Prop({ required: false })
  date_of_birth: Date;

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

  @Prop({
    required: false,
    default: null,
    set: encryptField,
    get: decryptField,
  })
  gender: string;

  @Prop({ default: false })
  is_mobile_verified: boolean;

  @Prop({ required: false, unique: true })
  emailHash: string;

  @Prop({ required: false, unique: true })
  mobileHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// **Utility function for encryption**
function encryptField(value: string): string {
  if (!value) return value;
  const encryptionKey = Buffer.from(process.env.FIELD_ENCRYPTION_KEY, 'base64');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encrypted = cipher.update(value.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

// **Utility function for decryption**
function decryptField(value: string): string {
  if (!value) return value;
  const encryptionKey = Buffer.from(process.env.FIELD_ENCRYPTION_KEY, 'base64');
  const [iv, encryptedText] = value.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    encryptionKey,
    Buffer.from(iv, 'hex'),
  );
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// **Middleware to hash `emailHash` and `mobileHash` before saving**
UserSchema.pre<UserDocument>('save', function (next) {
  // Ensure `emailHash` and `mobileHash` are always set
  if (!this.emailHash && this.email) {
    this.emailHash = generateHash(this.email);
  }
  if (!this.mobileHash && this.mobile_no) {
    this.mobileHash = generateHash(this.mobile_no);
  }
  next();
});

// Enable `getters` globally so that decryption happens automatically
UserSchema.set('toJSON', { getters: true });
UserSchema.set('toObject', { getters: true });
