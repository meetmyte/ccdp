import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { OpenAiService } from 'src/shared/service/openai.service';

@Module({
  imports: [],
  controllers: [ChatbotController],
  providers: [ChatbotService, OpenAiService],
})
export class ChatbotModule {}
