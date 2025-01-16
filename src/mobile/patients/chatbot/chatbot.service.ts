import { Injectable, BadRequestException } from '@nestjs/common';
import { OpenAiService } from 'src/shared/service/openai.service';
import { VisitsRepository } from 'src/shared/repositories/visits.repository';
import { AnswersRepository } from 'src/shared/repositories/answers.repository';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly openAiService: OpenAiService,
    private readonly visitsRepository: VisitsRepository,
    private readonly answersRepository: AnswersRepository,
  ) {}

  async generateResponse(question: string, patientId: string): Promise<string> {
    const openai = this.openAiService.getClient();

    // Fetch the patient's visits and answers
    const visits = await this.visitsRepository.findVisitsByPatientId(patientId);
    const visitIds = visits.map((visit) => visit._id);

    const answers =
      await this.answersRepository.findAnswersByVisitIds(visitIds);

    // Prepare the prompt with patient-specific data
    const patientSummary = this.generatePatientSummary(visits, answers);
    const prompt = this.generateChatbotPrompt(question, patientSummary);

    // const assistantContext = `
    //   You are an AI assistant specializing in cancer-related medical queries.
    //   Respond accurately and helpfully to questions within this scope, ensuring each response aligns with the latest medical knowledge.
    //   Use the patient's medical history provided below to answer the query.
    //   If a question is unrelated to cancer or the health, respond with:
    //   "Chatbot is trained to provide answers related to cancer. If you have any other questions, please contact 8980938142 or mailto:manthan@mytegroup.com for further assistance."
    //   Keep the response concise and under 50 words.
    // `;

    const assistantContext = `
    You are an AI assistant specializing in cancer-related and general health queries. 
    Respond to patients in a friendly, simple, and conversational tone. Avoid medical jargon. 
    Reassure them and suggest consulting a doctor if necessary.
    If a question is unrelated to cancer or the health, respond with:
    "Chatbot is trained to provide answers related to cancer only."
    Keep the response concise and under 50 words.
  `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // Use 'gpt-4' or 'gpt-4-turbo' as needed
        messages: [
          { role: 'system', content: assistantContext },
          { role: 'user', content: prompt },
        ],
      });

      const answer = response.choices[0].message.content;

      // Ensure the response is trimmed to 50 words or fewer
      const truncatedAnswer = answer.split(' ').slice(0, 50).join(' ');
      return truncatedAnswer;
    } catch (error) {
      console.error('Error generating chatbot response:', error);
      throw new BadRequestException('Failed to generate a response');
    }
  }

  private generatePatientSummary(visits: any[], answers: any[]): string {
    const visitSummaries = visits.map((visit) => {
      return `Visit on ${new Date(visit.date).toDateString()}:
      - Summary: ${JSON.stringify(visit.summary || 'No summary available')}`;
    });

    const answerSummaries = answers.map((answer) => {
      return `Category: ${answer.categoryId?.name || 'Unknown'}:
      - Question: ${answer.questionId?.text || 'Unknown'}
      - Answer: ${JSON.stringify(answer.answer || 'No answer')}`;
    });

    return `
      Patient's Visits:
      ${visitSummaries.join('\n')}

      Patient's Answers:
      ${answerSummaries.join('\n')}
    `;
  }

  private generateChatbotPrompt(
    userQuestion: string,
    patientData: string,
  ): string {
    const promptTemplate = `
      You are a specialized medical assistant AI trained to answer questions related to cancer and general health. 
      Your audience consists of patients, so your responses must be clear, simple, and conversational. Avoid complex medical jargon.
      
      Below is the patient's medical history:
      ${patientData}
  
      Guidelines for responding:
      1. Provide concise, friendly, and easy-to-understand responses.
      2. Explain how the symptom or question might relate to cancer or general health concerns based on the patient's medical history.
      3. If the symptom may not be related to cancer, suggest consulting a healthcare provider and provide reassurance.
      4. Keep responses under 50 words unless additional explanation is necessary.
  
      Patient Question: ${userQuestion}
  
      Example Responses:
      - "Dizziness can happen for many reasons, like dehydration or medication side effects. Please rest, drink water, and consult your doctor if it continues."
      - "Your dizziness might be related to treatments or health concerns. It's important to share this with your doctor for further advice."
  
      Answer this question in a way that the patient will find clear and helpful.
    `;

    return promptTemplate;
  }

  private generateDoctorPrompt(question: string, patientData: string): string {
    return `
      You are an advanced medical assistant AI designed to assist doctors in understanding patient data and answering medical queries. 
      Use the patient's medical history below to provide detailed and accurate insights in professional language. 
  
      Guidelines:
      1. Structure your response with detailed observations and actionable insights.
      2. Highlight any critical areas requiring attention based on the patient's history.
      3. Provide recommendations for further investigation or treatment when relevant.
      4. If a query cannot be answered with the given data, suggest steps to obtain the necessary information.
  
      Patient's Medical History:
      ${patientData}
  
      Doctor's Question:
      ${question}
  
      Example Response:
      - Based on the patient's history of chemotherapy and reported dizziness, it is likely due to dehydration or fatigue. Suggest monitoring hydration levels and scheduling a follow-up consultation.
      - If dizziness persists despite hydration, recommend further evaluation for underlying neurological conditions.
  
      Provide an accurate and concise response.
    `;
  }

  async generateDoctorResponse(
    question: string,
    patientId: string,
  ): Promise<string> {
    const openai = this.openAiService.getClient();

    // Fetch patient data
    const visits = await this.visitsRepository.findVisitsByPatientId(patientId);
    const visitIds = visits.map((visit) => visit._id);
    const answers =
      await this.answersRepository.findAnswersByVisitIds(visitIds);

    // Generate a detailed patient summary
    const patientSummary = this.generatePatientSummary(visits, answers);

    // Prepare the chatbot prompt
    const prompt = this.generateDoctorPrompt(question, patientSummary);

    const assistantContext = `
      You are an AI assistant designed for doctors, specializing in analyzing patient data and answering medically specific queries. 
      Ensure responses are concise, professional, and directly relevant to the patient's health history.
      If a question is unrelated to cancer or the health, respond with:
      "Chatbot is trained to provide answers related to cancer only."
      Keep the response concise and under 50 words.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // Use the appropriate model
        messages: [
          { role: 'system', content: assistantContext },
          { role: 'user', content: prompt },
        ],
      });

      const answer = response.choices[0].message.content;
      return answer;
    } catch (error) {
      console.error('Error generating chatbot response for doctor:', error);
      throw new BadRequestException('Failed to generate a response');
    }
  }
}
