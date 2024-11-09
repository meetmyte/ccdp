import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VisitDocument = Visit & Document;

@Schema({ timestamps: true })
export class Visit {
  @Prop({ required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  visitId: string;

  @Prop({ default: Date.now })
  date: Date;
}

export const VisitsSchema = SchemaFactory.createForClass(Visit);
