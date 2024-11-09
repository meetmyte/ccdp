// src/schemas/question.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

class Scale {
  @Prop({ required: true })
  min: number;

  @Prop({ required: true })
  max: number;

  @Prop({ required: true })
  description: string;
}

class QuestionOption {
  @Prop({ required: true })
  value: string;

  @Prop({ required: true })
  label: string;
}

class SubQuestion {
  @Prop()
  id?: string; // No longer required; it’s optional.

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: [QuestionOption], default: undefined })
  options?: QuestionOption[];

  @Prop({ default: undefined })
  unit?: string;

  @Prop({ default: undefined })
  additionalText?: string;

  @Prop({ type: [String], default: undefined })
  timeUnit?: string[];
}

@Schema({ timestamps: true, collection: 'questions' }) // Custom collection name
export class Question {
  // @Prop()
  // id?: number; // Optional since MongoDB will assign _id by default

  @Prop({ required: true })
  text: string;

  @Prop({
    required: true,
    enum: [
      'text',
      'scale',
      'boolean',
      'interactive_image',
      'number',
      'multiple',
      'mixed',
    ],
  })
  type: string;

  @Prop({ default: undefined })
  placeholder?: string;

  @Prop({ type: Scale, default: undefined })
  scale?: Scale;

  @Prop({ type: [QuestionOption], default: undefined })
  options?: QuestionOption[];

  @Prop({ type: [SubQuestion], default: undefined })
  subQuestions?: SubQuestion[];

  @Prop({ default: undefined })
  description?: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
