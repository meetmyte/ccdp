// src/schemas/visits.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// 1) Import the plugin
import * as mongooseFieldEncryption from 'mongoose-field-encryption';

export type VisitDocument = Visit & Document;

@Schema({ timestamps: true })
export class Visit {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  patientId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  visitId: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ type: Object, required: false, default: null }) // Add the summary field
  summary?: Record<string, any>; // Use Record to allow storing JSON

  @Prop({ type: Boolean, required: false, default: false })
  isSignalResolved: boolean;

  @Prop({ type: String, required: false, default: null })
  signalComments: string;
}

export const VisitsSchema = SchemaFactory.createForClass(Visit);

// 2) Apply the plugin to encrypt the `summary` field
VisitsSchema.plugin(mongooseFieldEncryption.fieldEncryption, {
  fields: ['summary'], // Any fields you want to encrypt
  secret: process.env.ENCRYPTION_KEY || 'YOUR_LONG_SECURE_KEY',
  // Optional: specify a custom salt generator if you need
  // deterministic encryption or have special requirements
  // saltGenerator: (secret) => '1234567890123456',
});
