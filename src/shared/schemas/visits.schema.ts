import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { encryptionPlugin } from '../plugins/encryption.plugin';

export type VisitDocument = Visit & Document;

@Schema({ timestamps: true })
export class Visit {
  @Prop({ required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  visitId: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ type: Object, required: false, default: null }) // Add the summary field
  summary?: Record<string, any>; // Use Record to allow storing JSON
}

export const VisitsSchema = SchemaFactory.createForClass(Visit);
VisitsSchema.plugin(encryptionPlugin, { fields: ['summary'] });
