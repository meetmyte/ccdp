import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Stores the ID of the patient or doctor.

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId; // Always references the patient.

  @Prop({ required: true,  })
  userType: string; // Either "doctor" or "patient" (who sent the message)

  @Prop({ type: String, required: true })
  message: string; // The chat message content.

  @Prop({ type: String, required: true })
  response: string; // The chatbot's response.

  @Prop({ type: Date, default: Date.now })
  createdAt: Date; // Timestamp of the message.
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
