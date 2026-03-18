import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from './entities/report.entity.js';
import { ListReportsQueryDto } from './dto/list-reports-query.dto.js';
import {
  withSchemaReadGuard,
} from '../database/schema-guard.js';

type ReportListItem = {
  id: number;
  reportId: string;
  intvId: string;
  userId: number;
  user: ReportEntity['user'];
  jobCategory: string | null;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  score: number | null;
  createdAt: string;
  completedAt: string | null;
};

type ReportDetailResponse = ReportListItem & {
  strengths: string[];
  improvements: string[];
  feedback: string | null;
  reportData: Record<string, unknown> | null;
  questionResults: [];
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
          '(CAST(report.id AS TEXT) ILIKE :search OR CAST(report.intv_id AS TEXT) ILIKE :search OR user.nickname ILIKE :search)',
          { search: `%${query.search}%` },
        );
      }

      const totalCount = await this.reportRepo.count();

      const columnMap: Record<string, string> = {
        completedAt: 'report.updated_at',
        createdAt: 'report.created_at',
        score: 'report.total_score',
      };
      qb.orderBy(
        columnMap[sortBy] ?? 'report.updated_at',
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
        sortBy === 'score' ? 'NULLS LAST' : undefined,
      );
      qb.skip((page - 1) * limit).take(limit);

      const [items, filteredCount] = await qb.getManyAndCount();

      return {
        totalCount,
        filteredCount,
        page,
        limit,
        items: items.map((item) => this.toReportListItem(item)),
      };
    }, '리포트');
  }

  async getReportById(reportId: string): Promise<ReportDetailResponse> {
    return withSchemaReadGuard(async () => {
      const numericId = Number(reportId);
      const report = await this.reportRepo.findOne({
        where: Number.isNaN(numericId) ? { id: -1 } : { id: numericId },
        relations: ['user'],
      });
      if (!report) {
        throw new NotFoundException({
          code: 'REPORT_NOT_FOUND',
          message: '해당 리포트를 찾을 수 없습니다.',
        });
      }

      const strengths = this.toStringArray(report.strengths);
      const improvements = this.toStringArray(report.weaknesses);

      return {
        ...this.toReportListItem(report),
        strengths,
        improvements,
        feedback: this.extractFeedback(report.reportData),
        reportData: report.reportData,
        questionResults: [],
      };
    }, '리포트');
  }

  private toReportListItem(report: ReportEntity): ReportListItem {
    return {
      id: report.id,
      reportId: String(report.id),
      intvId: String(report.intvId),
      userId: report.userId,
      user: report.user,
      jobCategory: report.jobCategory,
      status: this.normalizeStatus(report.status),
      score: report.totalScore,
      createdAt: report.createdAt.toISOString(),
      completedAt: report.status === 'IN_PROGRESS'
        ? null
        : report.updatedAt.toISOString(),
    };
  }

  private normalizeStatus(
    status: ReportEntity['status'],
  ): 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' {
    return status === 'SUCCEED' ? 'COMPLETED' : status;
  }

  private toStringArray(value: string[] | null): string[] {
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : [];
  }

  private extractFeedback(
    reportData: Record<string, unknown> | null,
  ): string | null {
    if (!reportData) {
      return null;
    }

    const directFeedback = reportData.feedback;
    if (typeof directFeedback === 'string') {
      return directFeedback;
    }

    const summary = reportData.summary;
    if (typeof summary === 'string') {
      return summary;
    }

    return null;
  }
}
