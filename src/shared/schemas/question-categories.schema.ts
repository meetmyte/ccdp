// src/schemas/category.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = QuestionCategories & Document;

@Schema({ timestamps: true, collection: 'question-categories' }) // Setting custom collection name
export class QuestionCategories {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Question' }] }) // Reference Question documents by ObjectId
  questions: Types.ObjectId[];
}

export const CategorySchema = SchemaFactory.createForClass(QuestionCategories);
