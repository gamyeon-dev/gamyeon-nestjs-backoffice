import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { ReportEntity } from './entities/report.entity.js';
import { QuestionResultEntity } from './entities/question-result.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity, QuestionResultEntity])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
