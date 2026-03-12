import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewsController } from './interviews.controller.js';
import { InterviewsService } from './interviews.service.js';
import { InterviewEntity } from './entities/interview.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([InterviewEntity])],
  controllers: [InterviewsController],
  providers: [InterviewsService],
})
export class InterviewsModule {}
