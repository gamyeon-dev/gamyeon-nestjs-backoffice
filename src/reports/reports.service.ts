import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from './entities/report.entity.js';
import { ListReportsQueryDto } from './dto/list-reports-query.dto.js';
import { QuestionResultEntity } from './entities/question-result.entity.js';
import {
  withSchemaReadGuard,
} from '../database/schema-guard.js';

type ReportDetailResponse = ReportEntity & {
  strengths: string[];
  improvements: string[];
};

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportRepo: Repository<ReportEntity>,
  ) {}

  async listReports(query: ListReportsQueryDto) {
    return withSchemaReadGuard(async () => {
      const { page = 1, limit = 20, sortOrder = 'desc' } = query;
      const sortBy = query.sortBy ?? 'completedAt';

      const qb = this.reportRepo
        .createQueryBuilder('report')
        .leftJoinAndSelect('report.user', 'user');

      if (query.status && query.status !== 'ALL') {
        qb.andWhere('report.status = :status', { status: query.status });
      }

      if (query.search) {
        qb.andWhere(
          '(report.report_id ILIKE :search OR user.nickname ILIKE :search)',
          { search: `%${query.search}%` },
        );
      }

      const totalCount = await this.reportRepo.count();

      const columnMap: Record<string, string> = {
        completedAt: 'report.completed_at',
        createdAt: 'report.created_at',
        score: 'report.score',
      };
      qb.orderBy(
        columnMap[sortBy] ?? 'report.completed_at',
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
        sortBy === 'score' ? 'NULLS LAST' : undefined,
      );
      qb.skip((page - 1) * limit).take(limit);

      const [items, filteredCount] = await qb.getManyAndCount();

      return { totalCount, filteredCount, page, limit, items };
    }, '리포트');
  }

  async getReportById(reportId: string): Promise<ReportDetailResponse> {
    return withSchemaReadGuard(async () => {
      const report = await this.reportRepo.findOne({
        where: { reportId },
        relations: ['user', 'questionResults'],
      });
      if (!report) {
        throw new NotFoundException({
          code: 'REPORT_NOT_FOUND',
          message: '해당 리포트를 찾을 수 없습니다.',
        });
      }

      const strengths = this.buildStrengths(report.questionResults);
      const improvements = this.buildImprovements(
        report.questionResults,
        strengths,
      );

      return {
        ...report,
        strengths,
        improvements,
      };
    }, '리포트');
  }

  private buildStrengths(questionResults: QuestionResultEntity[]): string[] {
    return questionResults
      .filter((result) => result.score !== null && result.score >= 80)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 3)
      .map((result) => result.feedback);
  }

  private buildImprovements(
    questionResults: QuestionResultEntity[],
    strengths: string[],
  ): string[] {
    const improvements = questionResults
      .filter((result) => result.score !== null && result.score < 80)
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .slice(0, 3)
      .map((result) => result.feedback)
      .filter((feedback) => !strengths.includes(feedback));

    if (improvements.length > 0) {
      return improvements;
    }

    const fallback = [...questionResults]
      .filter((result) => result.score !== null)
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .find((result) => !strengths.includes(result.feedback));

    if (fallback) {
      return [fallback.feedback];
    }

    const lowestScoreResult = [...questionResults]
      .filter((result) => result.score !== null)
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];

    return lowestScoreResult
      ? [`보완 필요: ${lowestScoreResult.feedback}`]
      : [];
  }
}
