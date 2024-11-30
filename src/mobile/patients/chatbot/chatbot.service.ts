import { Injectable, BadRequestException } from '@nestjs/common';
import { OpenAiService } from 'src/shared/service/openai.service';

@Injectable()
export class ChatbotService {
  constructor(private readonly openAiService: OpenAiService) {}

  async generateResponse(question: string): Promise<string> {
    const openai = this.openAiService.getClient();

    const prompt = this.generateChatbotPrompt(question);

    const assistantContext = `
      You are an AI assistant specializing in cancer-related medical queries. 
      Respond accurately and helpfully to questions within this scope, ensuring each response aligns with the latest medical knowledge. 
      Avoid repetition and irrelevant details. 
      If a question is unrelated to cancer, respond with: 
      "Chatbot is trained to provide answers related to cancer. If you have any other questions, please contact 8980938142 or mailto:manthan@mytegroup.com for further assistance." 
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

  private generateChatbotPrompt(userQuestion: string): string {
    const promptTemplate = `
      You are a specialized medical assistant AI trained to answer questions related to cancer. You should:

      1. Provide detailed, accurate, and clear responses to questions about cancer and its treatments.
      2. Avoid answering non-cancer-related questions. If a user asks a question unrelated to cancer, respond with: 
         "Chatbot is trained to provide answers related to cancer. If you have any other questions, please contact 8980938142 or mailto:manthan@mytegroup.com for further assistance."
      3. Ensure each response is specific, concise (maximum 50 words), and based on the latest cancer-related content.
      4. If the question seems ambiguous or contains multiple questions, either clarify the question or address each part logically.
      5. For questions with complex medical terminology, respond in a way that is understandable for general audiences but retains accuracy.

      User Question:
      ${userQuestion}

      Additional Notes:
      - Ensure the response is directly related to cancer. If unrelated, use the redirect message provided above.
      - Keep the response brief, clear, and focused (max 50 words).
    `;

    return promptTemplate;
  }
}
