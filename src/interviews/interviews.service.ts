import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewEntity } from './entities/interview.entity.js';
import { ListInterviewsQueryDto } from './dto/list-interviews-query.dto.js';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(InterviewEntity)
    private readonly interviewRepo: Repository<InterviewEntity>,
  ) {}

  async listInterviews(query: ListInterviewsQueryDto) {
    const { page = 1, limit = 20, sortOrder = 'desc' } = query;
    const sortBy = query.sortBy ?? 'createdAt';

    const qb = this.interviewRepo
      .createQueryBuilder('intv')
      .leftJoinAndSelect('intv.user', 'user');

    if (query.status) {
      qb.andWhere('intv.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(user.nickname ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.from) {
      qb.andWhere('intv.created_at >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('intv.created_at <= :to', {
        to: query.to + 'T23:59:59',
      });
    }

    const totalCount = await this.interviewRepo.count();

    const columnMap: Record<string, string> = {
      createdAt: 'intv.created_at',
      startedAt: 'intv.started_at',
      durationSeconds: 'intv.duration_seconds',
    };
    qb.orderBy(
      columnMap[sortBy] ?? 'intv.created_at',
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );
    qb.skip((page - 1) * limit).take(limit);

    const [items, filteredCount] = await qb.getManyAndCount();

    return { totalCount, filteredCount, page, limit, items };
  }

  async getInterviewById(id: number): Promise<InterviewEntity> {
    const interview = await this.interviewRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!interview) {
      throw new NotFoundException({
        code: 'INTERVIEW_NOT_FOUND',
        message: '해당 면접 세션을 찾을 수 없습니다.',
      });
    }
    return interview;
  }
}
