import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ['patient', 'doctor'] })
  userType: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: Boolean, default: false })
  isResolved: boolean;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
