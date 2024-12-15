import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DoctorPatientAssignmentDocument = DoctorPatientAssignment &
  Document;

@Schema({ timestamps: true })
export class DoctorPatientAssignment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // Doctor ID
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // Patient ID
  patientId: Types.ObjectId;

  @Prop({ default: Date.now })
  assignedDate: Date; // Date of assignment
}

export const DoctorPatientAssignmentSchema = SchemaFactory.createForClass(
  DoctorPatientAssignment,
);
