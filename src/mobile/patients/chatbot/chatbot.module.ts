import { forwardRef, Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { OpenAiService } from 'src/shared/service/openai.service';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [forwardRef(() => SharedModule)],
  controllers: [ChatbotController],
  providers: [ChatbotService, OpenAiService],
})
export class ChatbotModule {}
