import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionEntity } from './entities/question.entity';
import type { ListQuestionsQueryDto } from './dto/list-questions-query.dto';
import type { CreateQuestionDto } from './dto/create-question.dto';
import type { UpdateQuestionDto } from './dto/update-question.dto';
import {
  withSchemaReadGuard,
  withSchemaWriteGuard,
} from '../database/schema-guard.js';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepo: Repository<QuestionEntity>,
  ) {}

  async listQuestions(query: ListQuestionsQueryDto) {
    return withSchemaReadGuard(async () => {
      const { status, search, from, to, sortBy, sortOrder, page, limit } =
        query;

      const qb = this.questionRepo.createQueryBuilder('q');

      if (status) {
        qb.andWhere('q.status = :status', { status });
      }
      if (search) {
        qb.andWhere('q.content ILIKE :search', { search: `%${search}%` });
      }
      if (from) {
        qb.andWhere('q.created_at >= :from', { from });
      }
      if (to) {
        qb.andWhere('q.created_at <= :to', { to: `${to}T23:59:59Z` });
      }

      const totalCount = await this.questionRepo.count();
      const filteredCount = await qb.getCount();

      const sortColumnMap: Record<string, string> = {
        createdAt: 'q.created_at',
        updatedAt: 'q.updated_at',
      };

      qb.orderBy(
        sortColumnMap[sortBy] ?? 'q.created_at',
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
      );
      qb.skip((page - 1) * limit).take(limit);

      const items = await qb.getMany();

      return { totalCount, filteredCount, page, limit, items };
    }, '공통질문');
  }

  async createQuestion(dto: CreateQuestionDto) {
    return withSchemaWriteGuard(async () => {
      const now = new Date();
      const question = this.questionRepo.create({
        content: dto.content.trim(),
        status: dto.status ?? 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      });
      return this.questionRepo.save(question);
    }, '공통질문');
  }

  async updateQuestion(id: number, dto: UpdateQuestionDto) {
    return withSchemaWriteGuard(async () => {
      const question = await this.questionRepo.findOneBy({ id });
      if (!question) {
        throw new NotFoundException({
          code: 'QUESTION_NOT_FOUND',
          message: '해당 질문을 찾을 수 없습니다.',
        });
      }
      if (question.status === 'DELETED') {
        throw new BadRequestException({
          code: 'QUESTION_DELETED',
          message: '삭제된 질문은 수정할 수 없습니다.',
        });
      }
      if (dto.content !== undefined) {
        question.content = dto.content.trim();
      }
      if (dto.status !== undefined) {
        question.status = dto.status;
      }
      question.updatedAt = new Date();
      return this.questionRepo.save(question);
    }, '공통질문');
  }

  async deleteQuestion(id: number) {
    return withSchemaWriteGuard(async () => {
      const question = await this.questionRepo.findOneBy({ id });
      if (!question) {
        throw new NotFoundException({
          code: 'QUESTION_NOT_FOUND',
          message: '해당 질문을 찾을 수 없습니다.',
        });
      }
      if (question.status === 'DELETED') {
        throw new BadRequestException({
          code: 'ALREADY_DELETED',
          message: '이미 삭제된 질문입니다.',
        });
      }
      question.status = 'DELETED';
      question.deletedAt = new Date();
      question.updatedAt = new Date();
      const saved = await this.questionRepo.save(question);
      return { id: saved.id, status: saved.status, deletedAt: saved.deletedAt };
    }, '공통질문');
  }
}
