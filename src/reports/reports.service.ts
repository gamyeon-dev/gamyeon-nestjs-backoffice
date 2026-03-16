import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from './entities/report.entity.js';
import { ListReportsQueryDto } from './dto/list-reports-query.dto.js';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportRepo: Repository<ReportEntity>,
  ) {}

  async listReports(query: ListReportsQueryDto) {
    const { page = 1, limit = 20, sortOrder = 'desc' } = query;
    const sortBy = query.sortBy ?? 'completedAt';

    const qb = this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user');

    if (query.status) {
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
      completedAt: 'report.completedAt',
      createdAt: 'report.createdAt',
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
  }

  async getReportById(reportId: string): Promise<ReportEntity> {
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
    return report;
  }
}
