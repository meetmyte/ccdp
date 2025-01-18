import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongooseFieldEncryption from 'mongoose-field-encryption';

export type ConsultationDocument = Consultation & Document;

@Schema({ timestamps: true })
export class Consultation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Visit', required: true })
  visitId: Types.ObjectId;

  @Prop({ required: false, default: null })
  consultationSummary: string;

  @Prop({ required: false, default: null })
  conversation: string;

  @Prop({ default: null })
  consultationDate: Date;
}

export const ConsultationSchema = SchemaFactory.createForClass(Consultation);

ConsultationSchema.plugin(mongooseFieldEncryption.fieldEncryption, {
  fields: ['consultationSummary', 'conversation'], // Any fields you want to encrypt
  secret: process.env.ENCRYPTION_KEY || 'YOUR_LONG_SECURE_KEY',
  // Optional: specify a custom salt generator if you need
  // deterministic encryption or have special requirements
  // saltGenerator: (secret) => '1234567890123456',
});
