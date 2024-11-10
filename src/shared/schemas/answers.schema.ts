// src/shared/schemas/answers.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnswerDocument = Answer & Document;

@Schema({ timestamps: true, collection: 'answers' })
export class Answer {
  @Prop({ type: Types.ObjectId, ref: 'Visit', required: true })
  visitId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'QuestionCategories', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  questionId: Types.ObjectId;

  @Prop({ type: [Object], default: null })
  answer: Array<{
    text: string;
    answer: string | number | boolean;
    unit?: string;
  }>;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
