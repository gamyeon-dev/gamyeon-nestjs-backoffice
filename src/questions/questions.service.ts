import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateQuestionDto,
  ListQuestionsQuery,
  Question,
  QuestionStatus,
  UpdateQuestionDto,
} from './questions.types';

const QUESTIONS: Question[] = [
  {
    id: 'q001',
    content: '가면이 시스템을 어떻게 활용할 생각이세요?',
    status: 'ACTIVE',
    createdAt: '2025-01-09T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'q002',
    content: '본인이 기업 구직 활동에 가장 큰 문제를 설명해주시겠습니까?',
    status: 'ACTIVE',
    createdAt: '2025-01-09T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'q003',
    content: '직전 회사에서의 문제를 어떻게 해결했나요?',
    status: 'ACTIVE',
    createdAt: '2025-01-09T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'q004',
    content: '일 요리와가에서 협업했던 팀원이 없는 역할을 맡게 된다면?',
    status: 'ACTIVE',
    createdAt: '2025-01-09T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'q005',
    content:
      '본인의 단점을 솔직하게 말씀해주시고, 거기서 어떤 교훈을 얻었나요?',
    status: 'ACTIVE',
    createdAt: '2025-01-09T00:00:00Z',
    updatedAt: '2025-01-30T00:00:00Z',
  },
  {
    id: 'q006',
    content:
      '최근의 기술적인 문제를 어떻게 도입하고 있는지 방법들을 알려주세요.',
    status: 'INACTIVE',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'q007',
    content: '당신의 리더십을 발휘했던 경험을 이야기해주세요.',
    status: 'ACTIVE',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'q008',
    content:
      '이번에 지원하는 이 회사를 어떻게 찾으려고 하였나요? 말씀해주세요.',
    status: 'ACTIVE',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-26T00:00:00Z',
  },
];

let nextId = QUESTIONS.length + 1;

@Injectable()
export class QuestionsService {
  listQuestions(query: ListQuestionsQuery) {
    const status = this.parseStatus(query.status);
    const search = query.search?.trim().toLowerCase();
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));

    const filtered = QUESTIONS.filter((q) => {
      if (status && q.status !== status) return false;
      if (search && !q.content.toLowerCase().includes(search)) return false;
      if (query.from && q.createdAt < query.from) return false;
      if (query.to && q.createdAt > query.to + 'T23:59:59Z') return false;
      return true;
    });

    filtered.sort((a, b) => {
      const left = a[sortBy];
      const right = b[sortBy];
      if (left === right) return 0;
      return (left > right ? 1 : -1) * (sortOrder === 'asc' ? 1 : -1);
    });

    const start = (page - 1) * limit;
    return {
      totalCount: QUESTIONS.length,
      filteredCount: filtered.length,
      page,
      limit,
      items: filtered.slice(start, start + limit),
    };
  }

  createQuestion(dto: CreateQuestionDto): Question {
    if (!dto.content || dto.content.trim().length < 10) {
      throw new BadRequestException({
        code: 'INVALID_CONTENT',
        message: '질문 내용은 최소 10자 이상이어야 합니다.',
      });
    }
    const now = new Date().toISOString();
    const question: Question = {
      id: `q${String(nextId++).padStart(3, '0')}`,
      content: dto.content.trim(),
      status: dto.status ?? 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    QUESTIONS.push(question);
    return question;
  }

  updateQuestion(id: string, dto: UpdateQuestionDto): Question {
    const question = QUESTIONS.find((q) => q.id === id);
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
      if (dto.content.trim().length < 10) {
        throw new BadRequestException({
          code: 'INVALID_CONTENT',
          message: '질문 내용은 최소 10자 이상이어야 합니다.',
        });
      }
      question.content = dto.content.trim();
    }
    if (dto.status !== undefined) question.status = dto.status;
    question.updatedAt = new Date().toISOString();
    return question;
  }

  deleteQuestion(id: string) {
    const question = QUESTIONS.find((q) => q.id === id);
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
    const deletedAt = new Date().toISOString();
    question.status = 'DELETED';
    question.updatedAt = deletedAt;
    question.deletedAt = deletedAt;
    return { id: question.id, status: question.status, deletedAt };
  }

  private parseStatus(value?: string): QuestionStatus | undefined {
    if (!value) return undefined;
    const v = value.toUpperCase();
    if (v === 'ACTIVE' || v === 'INACTIVE' || v === 'DELETED')
      return v as QuestionStatus;
    return undefined;
  }
}
