import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { encryptionPlugin } from '../plugins/encryption.plugin';

export type AnswerDocument = Answer & Document;

@Schema({ timestamps: true, collection: 'answers' })
export class Answer {
  @Prop({ type: Types.ObjectId, ref: 'Visit', required: true })
  visitId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'QuestionCategories', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  questionId: Types.ObjectId;

  @Prop({ type: String }) // Field will be encrypted via plugin
  answer: string;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

// Apply the encryption plugin
AnswerSchema.plugin(encryptionPlugin, { fields: ['answer'] });
