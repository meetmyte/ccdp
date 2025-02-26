// import { Injectable, BadRequestException } from '@nestjs/common';
// import { OpenAiService } from 'src/shared/service/openai.service';
// import { VisitsRepository } from 'src/shared/repositories/visits.repository';
// import { AnswersRepository } from 'src/shared/repositories/answers.repository';

// @Injectable()
// export class ChatbotService {
//   constructor(
//     private readonly openAiService: OpenAiService,
//     private readonly visitsRepository: VisitsRepository,
//     private readonly answersRepository: AnswersRepository,
//   ) {}

//   async generateResponse(question: string, patientId: string): Promise<string> {
//     const openai = this.openAiService.getClient();

//     // Fetch the patient's visits and answers
//     const visits = await this.visitsRepository.findVisitsByPatientId(patientId);
//     const visitIds = visits.map((visit) => visit._id);

//     const answers =
//       await this.answersRepository.findAnswersByVisitIds(visitIds);

//     // Prepare the prompt with patient-specific data
//     const patientSummary = this.generatePatientSummary(visits, answers);
//     const prompt = this.generateChatbotPrompt(question, patientSummary);

//     // const assistantContext = `
//     //   You are an AI assistant specializing in cancer-related medical queries.
//     //   Respond accurately and helpfully to questions within this scope, ensuring each response aligns with the latest medical knowledge.
//     //   Use the patient's medical history provided below to answer the query.
//     //   If a question is unrelated to cancer or the health, respond with:
//     //   "Chatbot is trained to provide answers related to cancer. If you have any other questions, please contact 8980938142 or mailto:manthan@mytegroup.com for further assistance."
//     //   Keep the response concise and under 50 words.
//     // `;

//     const assistantContext = `
//     You are an AI assistant specializing in cancer-related and general health queries.
//     Respond to patients in a friendly, simple, and conversational tone. Avoid medical jargon.
//     Reassure them and suggest consulting a doctor if necessary.
//     If a question is unrelated to cancer or the health, respond with:
//     "Chatbot is trained to provide answers related to cancer only."
//     Keep the response concise and under 50 words.
//   `;

//     try {
//       const response = await openai.chat.completions.create({
//         model: 'gpt-4o', // Use 'gpt-4' or 'gpt-4-turbo' as needed
//         messages: [
//           { role: 'system', content: assistantContext },
//           { role: 'user', content: prompt },
//         ],
//       });

//       const answer = response.choices[0].message.content;

//       // Ensure the response is trimmed to 50 words or fewer
//       const truncatedAnswer = answer.split(' ').slice(0, 50).join(' ');
//       return truncatedAnswer;
//     } catch (error) {
//       console.error('Error generating chatbot response:', error);
//       throw new BadRequestException('Failed to generate a response');
//     }
//   }

//   private generatePatientSummary(visits: any[], answers: any[]): string {
//     const visitSummaries = visits.map((visit) => {
//       return `Visit on ${new Date(visit.date).toDateString()}:
//       - Summary: ${JSON.stringify(visit.summary || 'No summary available')}`;
//     });

//     const answerSummaries = answers.map((answer) => {
//       return `Category: ${answer.categoryId?.name || 'Unknown'}:
//       - Question: ${answer.questionId?.text || 'Unknown'}
//       - Answer: ${JSON.stringify(answer.answer || 'No answer')}`;
//     });

//     return `
//       Patient's Visits:
//       ${visitSummaries.join('\n')}

//       Patient's Answers:
//       ${answerSummaries.join('\n')}
//     `;
//   }

//   private generateChatbotPrompt(
//     userQuestion: string,
//     patientData: string,
//   ): string {
//     const promptTemplate = `
//       You are a specialized medical assistant AI trained to answer questions related to cancer and general health.
//       Your audience consists of patients, so your responses must be clear, simple, and conversational. Avoid complex medical jargon.

//       Below is the patient's medical history:
//       ${patientData}

//       Guidelines for responding:
//       1. Provide concise, friendly, and easy-to-understand responses.
//       2. Explain how the symptom or question might relate to cancer or general health concerns based on the patient's medical history.
//       3. If the symptom may not be related to cancer, suggest consulting a healthcare provider and provide reassurance.
//       4. Keep responses under 50 words unless additional explanation is necessary.

//       Patient Question: ${userQuestion}

//       Example Responses:
//       - "Dizziness can happen for many reasons, like dehydration or medication side effects. Please rest, drink water, and consult your doctor if it continues."
//       - "Your dizziness might be related to treatments or health concerns. It's important to share this with your doctor for further advice."

//       Answer this question in a way that the patient will find clear and helpful.
//     `;

//     return promptTemplate;
//   }

//   private generateDoctorPrompt(question: string, patientData: string): string {
//     return `
//       You are an advanced medical assistant AI designed to assist doctors in understanding patient data and answering medical queries.
//       Use the patient's medical history below to provide detailed and accurate insights in professional language.

//       Guidelines:
//       1. Structure your response with detailed observations and actionable insights.
//       2. Highlight any critical areas requiring attention based on the patient's history.
//       3. Provide recommendations for further investigation or treatment when relevant.
//       4. If a query cannot be answered with the given data, suggest steps to obtain the necessary information.

//       Patient's Medical History:
//       ${patientData}

//       Doctor's Question:
//       ${question}

//       Example Response:
//       - Based on the patient's history of chemotherapy and reported dizziness, it is likely due to dehydration or fatigue. Suggest monitoring hydration levels and scheduling a follow-up consultation.
//       - If dizziness persists despite hydration, recommend further evaluation for underlying neurological conditions.

//       Provide an accurate and concise response.
//     `;
//   }

//   async generateDoctorResponse(
//     question: string,
//     patientId: string,
//   ): Promise<string> {
//     const openai = this.openAiService.getClient();

//     // Fetch patient data
//     const visits = await this.visitsRepository.findVisitsByPatientId(patientId);
//     const visitIds = visits.map((visit) => visit._id);
//     const answers =
//       await this.answersRepository.findAnswersByVisitIds(visitIds);

//     // Generate a detailed patient summary
//     const patientSummary = this.generatePatientSummary(visits, answers);

//     // Prepare the chatbot prompt
//     const prompt = this.generateDoctorPrompt(question, patientSummary);

//     const assistantContext = `
//       You are an AI assistant designed for doctors, specializing in analyzing patient data and answering medically specific queries.
//       Ensure responses are concise, professional, and directly relevant to the patient's health history.
//       If a question is unrelated to cancer or the health, respond with:
//       "Chatbot is trained to provide answers related to cancer only."
//       Keep the response concise and under 50 words.
//     `;

//     try {
//       const response = await openai.chat.completions.create({
//         model: 'gpt-4o', // Use the appropriate model
//         messages: [
//           { role: 'system', content: assistantContext },
//           { role: 'user', content: prompt },
//         ],
//       });

//       const answer = response.choices[0].message.content;
//       return answer;
//     } catch (error) {
//       console.error('Error generating chatbot response for doctor:', error);
//       throw new BadRequestException('Failed to generate a response');
//     }
//   }
// }

import { Injectable, BadRequestException } from '@nestjs/common';
import { OpenAiService } from 'src/shared/service/openai.service';
import { VisitsRepository } from 'src/shared/repositories/visits.repository';
import { AnswersRepository } from 'src/shared/repositories/answers.repository';
import * as fs from 'fs';
import * as path from 'path';
import { ChatRepository } from 'src/shared/repositories/chat.repository';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly openAiService: OpenAiService,
    private readonly visitsRepository: VisitsRepository,
    private readonly answersRepository: AnswersRepository,
    private readonly chatRepository: ChatRepository, // Injected Chat Repository
  ) {}

  async generateResponse(question: string, patientId: string): Promise<string> {
    const openai = this.openAiService.getClient();

    // Fetch patient visits & answers
    const visits = await this.visitsRepository.findVisitsByPatientId(patientId);
    const visitIds = visits.map((visit) => visit._id);
    const answers =
      await this.answersRepository.findAnswersByVisitIds(visitIds);

    // Fetch chat history
    const conversationHistory =
      await this.chatRepository.getPatientChatHistory(patientId);

    // Prepare patient summary
    const patientSummary = this.generatePatientSummary(
      visits,
      answers,
      conversationHistory,
    );

    // Prepare AI prompt
    const prompt = this.generateChatbotPrompt(question, patientSummary);

    const systemContext = `
      You are a helpful assistant providing insights and answers based on the provided context and inferred knowledge.
    `;

    const assistantContext = `
      Only provide the most helpful answer. Use the length needed to provide the most helpful answer. For answers where succinct responses can work (like yes, no, or short answers based on context), then do so. Use your judgment for response length.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemContext },
          { role: 'assistant', content: assistantContext },
          { role: 'user', content: prompt },
        ],
      });

      const answer = response.choices[0].message.content;

      // Store conversation history
      await this.chatRepository.saveChat(
        patientId,
        patientId,
        'patient',
        question,
        answer,
      );

      return answer;
    } catch (error) {
      console.error('Error generating chatbot response:', error);
      throw new BadRequestException('Failed to generate a response');
    }
  }

  async generateDoctorResponse(
    question: string,
    patientId: string,
    doctorId: string,
  ): Promise<string> {
    const openai = this.openAiService.getClient();

    // Fetch patient visits & answers
    const visits = await this.visitsRepository.findVisitsByPatientId(patientId);
    const visitIds = visits.map((visit) => visit._id);
    const answers =
      await this.answersRepository.findAnswersByVisitIds(visitIds);

    // Fetch chat history
    const conversationHistory = await this.chatRepository.getDoctorChatHistory(
      patientId,
      doctorId,
    );

    // Prepare patient summary
    const patientSummary = this.generatePatientSummary(
      visits,
      answers,
      conversationHistory,
    );

    // Prepare AI prompt
    const prompt = this.generateDoctorPrompt(question, patientSummary);

    const systemContext = `
      You are a helpful assistant providing insights and answers based on the provided context and inferred knowledge.
    `;

    const assistantContext = `
      Only provide the most helpful answer. Use the length needed to provide the most helpful answer. For answers where succinct responses can work (like yes, no, or short answers based on context), then do so. Use your judgment for response length.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemContext },
          { role: 'assistant', content: assistantContext },
          { role: 'user', content: prompt },
        ],
      });

      const answer = response.choices[0].message.content;

      // Store conversation history
      await this.chatRepository.saveChat(
        doctorId,
        patientId,
        'doctor',
        question,
        answer,
      );

      return answer;
    } catch (error) {
      console.error('Error generating chatbot response for doctor:', error);
      throw new BadRequestException('Failed to generate a response');
    }
  }

  private generatePatientSummary(
    visits: any[],
    answers: any[],
    conversationHistory: any[],
  ): string {
    const visitSummaries = visits.length
      ? visits.map(
          (visit) =>
            `Visit on ${new Date(visit.date).toDateString()}: Summary: ${JSON.stringify(visit.summary || 'No summary available')}`,
        )
      : ['No visits done yet'];

    const answerSummaries = answers.length
      ? answers.map(
          (answer) =>
            `Category: ${answer.categoryId?.name || 'Unknown'} - Question: ${answer.questionId?.text || 'Unknown'} - Answer: ${JSON.stringify(answer.answer || 'No answer')}`,
        )
      : ['No consultations done yet'];

    const chatSummaries = conversationHistory.length
      ? conversationHistory.map(
          (chat) => `Q: ${chat.message} A: ${chat.response}`,
        )
      : ['No previous chatbot conversation'];

    return `
      Here is the Context of the patient:

      1. All patient onboarding visit data: [${visitSummaries.join('\n')}]
      2. All patient consultation data: [${answerSummaries.join('\n')}]
      3. Conversation History (all history with chatbot): [${chatSummaries.join('\n')}]

      If asked about the hospital, here is context to fuel your response:
      [[ I am not trained on the hospital information, this is coming soon ]]
    `;
  }

  private generateChatbotPrompt(
    userQuestion: string,
    patientData: string,
  ): string {
    return `
      ${patientData}

      # Cross reference the context and previous conversation history.
      # Provide the most helpful response to the user.

      Patient Question: ${userQuestion}
    `;
  }

  private generateDoctorPrompt(
    userQuestion: string,
    patientData: string,
  ): string {
    return `
      ${patientData}

      # Cross reference the context and previous conversation history.
      # Provide the most insightful and medically relevant response to the doctor.

      Doctor's Question: ${userQuestion}
    `;
  }

  async getChatHistoryForPatient(patientId: string) {
    return await this.chatRepository.getPatientChatHistory(patientId);
  }

  async getChatHistoryForDoctor(patientId: string, doctorId: string) {
    return await this.chatRepository.getDoctorChatHistory(patientId, doctorId);
  }

  private getTempFilePath(sessionId: string, ext = '.webm'): string {
    const tempChunkDir = path.join(process.cwd(), 'temp_chunks');
    if (!fs.existsSync(tempChunkDir)) {
      fs.mkdirSync(tempChunkDir, { recursive: true });
    }
    return path.join(tempChunkDir, `${sessionId}${ext}`);
  }

  /**
   * Processes base64 audio data sent from the client.
   * It removes any data URI prefix, converts the base64 string into a Buffer,
   * and appends that Buffer to a temporary file identified by sessionId.
   *
   * @param body - The request body containing the base64 audio data and an optional filename.
   * @param sessionId - The unique session identifier for this recording.
   */
  async uploadAudioBase64(
    body: { audio: string },
    sessionId: string,
    chunkId: string,
  ): Promise<void> {
    if (!body.audio) {
      throw new BadRequestException('No audio data provided');
    }

    const base64Data = body.audio.replace(/^data:.*;base64,/, '');
    const sessionDir = path.join(process.cwd(), 'temp_chunks', sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const chunkFilePath = path.join(sessionDir, `${chunkId}.mp4`);
    const buffer = Buffer.from(base64Data, 'base64');

    fs.writeFileSync(chunkFilePath, buffer);
    console.log(`Chunk saved: ${chunkFilePath}, size=${buffer.length} bytes`);
  }
  async transcribeChunk(sessionId: string, chunkId: string): Promise<string> {
    const chunkFilePath = path.join(
      process.cwd(),
      'temp_chunks',
      sessionId,
      `${chunkId}.mp4`,
    );

    if (!fs.existsSync(chunkFilePath)) {
      throw new BadRequestException('No audio data found for this chunk');
    }

    return this.openAiService.transcribeVoiceToText(chunkFilePath);
  }

  async transcribeAudio(sessionId: string): Promise<string> {
    let tempFilePath = this.getTempFilePath(sessionId, '.webm');
    console.log('tempFilePath', tempFilePath);
    if (!fs.existsSync(tempFilePath)) {
      tempFilePath = this.getTempFilePath(sessionId, '.mp4');
      if (!fs.existsSync(tempFilePath)) {
        throw new BadRequestException('No audio data for this session');
      }
    }
    return this.openAiService.transcribeVoiceToText(tempFilePath);
  }

  async cleanupAudio(sessionId: string): Promise<void> {
    let tempFilePath = this.getTempFilePath(sessionId, '.webm');
    if (!fs.existsSync(tempFilePath)) {
      tempFilePath = this.getTempFilePath(sessionId, '.mp4');
      if (!fs.existsSync(tempFilePath)) {
        throw new BadRequestException('No audio file found for this session');
      }
    }
    fs.unlinkSync(tempFilePath);
  }
}
