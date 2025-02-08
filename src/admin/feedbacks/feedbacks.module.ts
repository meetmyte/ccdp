import { Module } from '@nestjs/common';
import { FeedbackService } from './feedbacks.service';
import { FeedbackController } from './feedbacks.controller';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbacksModule {}
