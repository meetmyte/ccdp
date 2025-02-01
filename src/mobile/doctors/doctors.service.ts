import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { AssignPatientDto } from './dto/assign-patient.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { DoctorPatientAssignmentRepository } from 'src/shared/repositories/doctor-patients.repository';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';
import { ConsultationRepository } from 'src/shared/repositories/consultation.repository';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { Types } from 'mongoose';
import { VisitsService } from '../patients/visits/visits.service';
import { OpenAiService } from 'src/shared/service/openai.service';

@Injectable()
export class DoctorsService {
  constructor(
    private readonly doctorPatientAssignmentRepository: DoctorPatientAssignmentRepository,
    private readonly userRepository: UserRepository,
    private readonly consultationRepository: ConsultationRepository,
    private readonly visitsService: VisitsService,
    private readonly openAiService: OpenAiService,
  ) {}

  async assignPatientToDoctor(
    assignPatientDto: AssignPatientDto,
    doctorId,
  ): Promise<ResponseDto> {
    const { patientId } = assignPatientDto;
    // Check if doctor exists
    const doctor = await this.userRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Check if patient exists
    const patient = await this.userRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Check if already assigned
    const existingAssignment =
      await this.doctorPatientAssignmentRepository.findOne({
        doctorId: new Types.ObjectId(doctorId),
        patientId: new Types.ObjectId(patientId),
      });

    if (existingAssignment) {
      return ResponseDto.success(
        {
          ...existingAssignment.toJSON(),
          patient: {
            first_name: patient.first_name,
            last_name: patient.last_name,
            email: patient.email,
            mobile_no: patient.mobile_no,
            gender: patient.gender,
            medicare_code: patient.medicare_code,
          },
        },
        'Patient assigned to doctor successfully',
      );
    }

    // Create the assignment
    const assignment = await this.doctorPatientAssignmentRepository.create({
      doctorId: new Types.ObjectId(doctorId),
      patientId: new Types.ObjectId(patientId),
      assignedDate: new Date(),
    });

    return ResponseDto.success(
      {
        ...assignment,
        patient: {
          first_name: patient.first_name,
          last_name: patient.last_name,
          email: patient.email,
          mobile_no: patient.mobile_no,
          gender: patient.gender,
          medicare_code: patient.medicare_code,
        },
      },
      'Patient assigned to doctor successfully',
    );
  }

  async listAssignedPatients(
    doctorId: string,
    paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    const { filters, page, limit, sortBy, sortOrder } = paginationFilterDto;

    let parsedFilters = {};
    if (filters) {
      try {
        parsedFilters = JSON.parse(filters);
      } catch (error) {
        console.log('🚀 ~ DoctorsService ~ error:', error);
        throw new BadRequestException('Invalid filters format');
      }
    }

    const { patients, totalCount } =
      await this.doctorPatientAssignmentRepository.getAssignedPatientsWithPagination(
        doctorId,
        parsedFilters,
        page,
        limit,
        sortBy,
        sortOrder,
      );

    const pageInfo = {
      page: page || 1,
      limit: limit || 10,
      total: totalCount,
    };

    return ResponseDto.success(
      { patients, pageInfo },
      'Patients listed successfully',
    );
  }

  async addConsultation(
    createConsultationDto: CreateConsultationDto,
  ): Promise<ResponseDto> {
    const { patientId, doctorId, visitId, ...rest } = createConsultationDto;

    const patientData = await (
      await this.userRepository.getTable()
    )
      .findOne({
        _id: new Types.ObjectId(patientId),
      })
      .lean();

    // Convert string IDs to ObjectId
    const consultationData = {
      ...rest,
      patientId: new Types.ObjectId(patientId),
      doctorId: new Types.ObjectId(doctorId),
      visitId: new Types.ObjectId(visitId),
    };

    if (rest.conversation) {
      rest.consultationSummary = await this.generateDoctorSummaryUsingAi(
        rest.conversation,
        patientData,
      );
    }
    const consultation = await this.consultationRepository.createConsultation({
      ...consultationData,
      consultationSummary: rest.consultationSummary,
    });
    return ResponseDto.success(consultation, 'Consultation added successfully');
  }

  async listConsultationsByDoctorId(
    paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    const { consultations, totalCount } =
      await this.consultationRepository.findConsultationsByDoctorId(
        paginationFilterDto,
      );

    const pageInfo = {
      page: paginationFilterDto.page || 1,
      limit: paginationFilterDto.limit || 10,
      total: totalCount,
    };

    return ResponseDto.success(
      { consultations, pageInfo },
      'Consultations retrieved successfully',
    );
  }

  async updateConsultation(
    consultationId: string,
    updateConsultationDto: UpdateConsultationDto,
  ): Promise<ResponseDto> {
    try {
      const { patientId, doctorId, visitId, ...rest } = updateConsultationDto;

      // Convert string IDs to ObjectId if provided
      const updateData = {
        ...rest,
        ...(patientId && { patientId: new Types.ObjectId(patientId) }),
        ...(doctorId && { doctorId: new Types.ObjectId(doctorId) }),
        ...(visitId && { visitId: new Types.ObjectId(visitId) }),
      };

      const updatedConsultation =
        await this.consultationRepository.updateConsultation(
          consultationId,
          updateData,
        );

      if (!updatedConsultation) {
        return ResponseDto.error('Consultation not found', 404);
      }

      return ResponseDto.success(
        updatedConsultation,
        'Consultation updated successfully',
      );
    } catch (error) {
      return ResponseDto.error(error.message, 500);
    }
  }

  async deleteConsultation(consultationId: string): Promise<ResponseDto> {
    const consultation =
      await this.consultationRepository.findConsultationById(consultationId);

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    await this.consultationRepository.deleteConsultation(consultationId);
    return ResponseDto.success(null, 'Consultation deleted successfully');
  }

  async getVisitsByPatientId(
    doctorId: string,
    patientId: string,
  ): Promise<any> {
    try {
      const checkAssignment =
        await this.doctorPatientAssignmentRepository.findOne({
          doctorId: new Types.ObjectId(doctorId),
          patientId: new Types.ObjectId(patientId),
        });

      if (!checkAssignment) {
        return ResponseDto.error('Patient not assigned to doctor', 404);
      }

      const visits = await this.visitsService.allVistisOfPatient(patientId);
      return ResponseDto.success(visits, 'Visits retrived successfully.');
    } catch (error) {
      return ResponseDto.error(error.message || 'Something went wrong.', 500);
    }
  }

  async storeAnswer(
    visitId: string,
    categoryId: string,
    questionId: string,
    answer: any,
  ) {
    try {
      const result = await this.visitsService.storeAnswer(
        visitId,
        categoryId,
        questionId,
        answer,
      );
      return ResponseDto.success(result, 'Answer stored successfully');
    } catch (error) {
      return ResponseDto.error(error.message || 'Something went wrong.', 500);
    }
  }

  async getDashboardMetrics(doctorId: string): Promise<ResponseDto> {
    try {
      // 1. Get the total number of consultations for the doctor
      const getTotalConsultations =
        await this.consultationRepository.getTotalCounts(doctorId);
      // 2. Get today's consultations for the doctor
      const todaysConsultations =
        await this.consultationRepository.getTodayTotalCounts(doctorId);

      // Return the response with resolved values
      return ResponseDto.success(
        {
          totalConsultations: getTotalConsultations,
          todaysConsultations: todaysConsultations,
        },
        'Success',
      );
    } catch (error) {
      // Handle any errors gracefully
      return ResponseDto.error(error.message || 'Something went wrong.', 500);
    }
  }

  async getAnswersByVisitId(visitId: string): Promise<ResponseDto> {
    try {
      const answers = await this.visitsService.getAnswersByVisitId(visitId);
      return ResponseDto.success(answers, 'Answers retrieved successfully.');
    } catch (error) {
      return ResponseDto.error(error.message || 'Something went wrong.', 500);
    }
  }

  async generatePatientProfile(visitId: string): Promise<ResponseDto> {
    try {
      const answers = await this.visitsService.generatePatientProfile(visitId);
      return ResponseDto.success(answers, 'Answers retrieved successfully.');
    } catch (error) {
      return ResponseDto.error(error.message || 'Something went wrong.', 500);
    }
  }

  // async generateDoctorSummaryUsingAi(doctorConversation: string): Promise<any> {
  //   try {
  //     const openai = this.openAiService.getClient(); // Get the OpenAI client

  //     const promptTemplate = `
  //     You are an advanced medical assistant AI. Based on the following doctor's consultation conversation, generate a detailed and coherent summary suitable for both the patient and medical professionals. The summary should highlight the key points discussed during the consultation and provide actionable insights where applicable.

  //     Ensure the summary includes the following:
  //     1. A structured narrative that clearly outlines the doctor's observations, advice, and recommended actions in a professional and easy-to-understand language.
  //     2. Key medical insights and observations drawn from the consultation.
  //     3. A section for follow-up recommendations or additional diagnostics/tests, if mentioned in the conversation.

  //     Additionally, provide the summary in a structured JSON format suitable for frontend rendering. The JSON should include:
  //     1. A \`summary\` field that contains the detailed narrative summary.
  //     2. A \`keyPoints\` array, listing the major takeaways from the conversation.
  //     3. A \`recommendations\` field for any follow-ups or actionable items.

  //     Doctor's Consultation:
  //     ${doctorConversation}
  //     `;

  //     const assistantContext =
  //       'Generate a structured summary of the doctor’s conversation in JSON format, highlighting key points and follow-up recommendations.';

  //     const response = await openai.chat.completions.create({
  //       model: 'gpt-4o',
  //       messages: [
  //         { role: 'system', content: assistantContext },
  //         { role: 'user', content: promptTemplate },
  //       ],
  //     });

  //     // Extract raw content from response
  //     const summaryText = response.choices[0].message.content;

  //     console.log('Raw summaryText:', summaryText);

  //     // Clean the response to remove code fences and extra formatting
  //     const cleanedSummaryText = summaryText
  //       .replace(/```json\n|```/g, '')
  //       .trim();

  //     console.log('Cleaned summaryText:', cleanedSummaryText);

  //     // Try parsing the cleaned response as JSON
  //     try {
  //       const parsedJson = JSON.parse(cleanedSummaryText);
  //       return parsedJson;
  //     } catch (error) {
  //       console.error('JSON Parsing Error:', error);
  //       return {
  //         error: 'Response could not be formatted as JSON',
  //         content: cleanedSummaryText,
  //       };
  //     }
  //   } catch (error) {
  //     console.error('Error generating doctor summary:', error);
  //     throw new InternalServerErrorException(
  //       'Failed to generate doctor summary',
  //     );
  //   }
  // }

  // async generateDoctorSummaryUsingAi(
  //   doctorConversation: string,
  // ): Promise<string> {
  //   try {
  //     const openai = this.openAiService.getClient(); // Get the OpenAI client

  //     const promptTemplate = `
  //     You are an advanced medical assistant AI. Based on the following doctor's consultation conversation, generate a detailed and coherent summary suitable for both the patient and medical professionals. The summary should highlight the key points discussed during the consultation and provide actionable insights where applicable.

  //     Ensure the summary includes the following:
  //     1. A structured narrative that clearly outlines the doctor's observations, advice, and recommended actions in a professional and easy-to-understand language.
  //     2. Key medical insights and observations drawn from the consultation.
  //     3. A section for follow-up recommendations or additional diagnostics/tests, if mentioned in the conversation.

  //     Provide the summary as a single paragraph suitable for inclusion in a medical record.

  //     Doctor's Consultation:
  //     ${doctorConversation}
  //     `;

  //     const assistantContext =
  //       'Generate a structured and detailed summary of the doctor’s conversation as a single paragraph, highlighting observations, advice, and recommendations.';

  //     const response = await openai.chat.completions.create({
  //       model: 'gpt-4o',
  //       messages: [
  //         { role: 'system', content: assistantContext },
  //         { role: 'user', content: promptTemplate },
  //       ],
  //     });

  //     // Extract raw content from response
  //     const summaryText = response.choices[0].message.content.trim();

  //     console.log('Generated Summary:', summaryText);

  //     return summaryText;
  //   } catch (error) {
  //     console.error('Error generating doctor summary:', error);
  //     throw new InternalServerErrorException(
  //       'Failed to generate doctor summary',
  //     );
  //   }
  // }

  async generateDoctorSummaryUsingAi(
    doctorConversation: string,
    patient: any, // Patient data including name, age, medical history, etc.
  ): Promise<string> {
    try {
      const openai = this.openAiService.getClient(); // Get the OpenAI client

      const promptTemplate = `
        You are an advanced medical assistant AI. Based on the following doctor's consultation conversation and patient information, generate a detailed and coherent medical report suitable for both patients and medical professionals.
    
        **Patient Information:**
        Name: ${patient.first_name || 'N/A'} ${patient.last_name || ''}
        Email: ${patient.email || 'N/A'}
        Medical ID: ${patient.medicare_code || 'N/A'}
        Date of Birth: ${patient.date_of_birth || 'N/A'}
    
        **Doctor's Consultation:**
        ${doctorConversation}
    
        The report must include the following sections:
        1. **Observations**: Key medical insights and observations drawn from the doctor's discussion and patient data.
        2. **Advice/Recommendations**: Suggestions provided by the doctor to the patient, including actionable steps for treatment or lifestyle modifications.
        3. **Prescriptions**: List any medications prescribed during the consultation, including dosages and instructions.
        4. **Tests/Diagnostics**: Mention any tests or diagnostics recommended by the doctor during the consultation.
        5. **Follow-up Instructions**: Include any follow-up actions, such as scheduling appointments or monitoring symptoms.
    
        Format the report in a structured format, and ensure the language is professional yet easy to understand for patients. Provide the summary as a clear, concise report.
      `;

      const assistantContext = `
        Generate a structured and detailed medical report based on the provided patient data and doctor's consultation. The report should include observations, recommendations, prescriptions, diagnostics, and follow-up instructions.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // Use 'gpt-4' or 'gpt-4-turbo' as needed
        messages: [
          { role: 'system', content: assistantContext },
          { role: 'user', content: promptTemplate },
        ],
      });

      // Extract the raw content from the response
      const summaryText = response.choices[0].message.content.trim();

      console.log('Generated Doctor Report:', summaryText);

      return summaryText;
    } catch (error) {
      console.error('Error generating doctor summary:', error);
      throw new InternalServerErrorException(
        'Failed to generate doctor summary',
      );
    }
  }
}
