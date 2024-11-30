import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { VisitsModule } from './visits/visits.module';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [AuthModule, VisitsModule, ChatbotModule],
})
export class PatientsModule {}
