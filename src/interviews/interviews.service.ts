import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  InterviewDetail,
  InterviewStatus,
  InterviewSummary,
  ListInterviewsQuery,
} from './interviews.types';

const INTERVIEWS: InterviewDetail[] = [
  {
    sessionId: 's057',
    user: { id: 3, nickname: '황지연', email: 'jiyeon.hwang@example.com' },
    jobCategory: '스타트업',
    careerLevel: '3년차',
    status: 'INTERRUPTED',
    progressRate: 80,
    durationSeconds: 220,
    startedAt: '2026-02-26T08:00:00Z',
    endedAt: '2026-02-26T08:03:40Z',
    totalQuestions: 5,
    answeredQuestions: 4,
    interruptReason: 'USER_EXIT',
    questions: [
      {
        order: 1,
        content: '자신의 강점을 말씀해 주세요.',
        answered: true,
        answerDurationSeconds: 45,
      },
      {
        order: 2,
        content: '팀 프로젝트 경험을 설명해주세요.',
        answered: true,
        answerDurationSeconds: 60,
      },
      {
        order: 3,
        content: '가장 어려웠던 프로젝트는?',
        answered: true,
        answerDurationSeconds: 55,
      },
      {
        order: 4,
        content: '5년 후 목표는 무엇인가요?',
        answered: true,
        answerDurationSeconds: 40,
      },
      {
        order: 5,
        content: '마지막으로 하고 싶은 말은?',
        answered: false,
        answerDurationSeconds: null,
      },
    ],
  },
  {
    sessionId: 's088',
    user: { id: 6, nickname: '박민재', email: 'minjae.park@example.com' },
    jobCategory: '중소기업',
    careerLevel: null,
    status: 'COMPLETED',
    progressRate: 100,
    durationSeconds: 190,
    startedAt: '2026-02-24T10:00:00Z',
    endedAt: '2026-02-24T10:03:10Z',
    totalQuestions: 5,
    answeredQuestions: 5,
    interruptReason: null,
    questions: [
      {
        order: 1,
        content: '자기소개를 해주세요.',
        answered: true,
        answerDurationSeconds: 38,
      },
      {
        order: 2,
        content: '지원 동기는 무엇인가요?',
        answered: true,
        answerDurationSeconds: 42,
      },
      {
        order: 3,
        content: '본인의 강점은?',
        answered: true,
        answerDurationSeconds: 35,
      },
      {
        order: 4,
        content: '약점과 극복 방법은?',
        answered: true,
        answerDurationSeconds: 40,
      },
      {
        order: 5,
        content: '입사 후 계획은?',
        answered: true,
        answerDurationSeconds: 35,
      },
    ],
  },
  {
    sessionId: 's424',
    user: { id: 8, nickname: '정다현', email: 'dahyun.jung@example.com' },
    jobCategory: '백엔드',
    careerLevel: null,
    status: 'INTERRUPTED',
    progressRate: 30,
    durationSeconds: 46,
    startedAt: '2026-02-22T11:00:00Z',
    endedAt: '2026-02-22T11:00:46Z',
    totalQuestions: 5,
    answeredQuestions: 1,
    interruptReason: 'NETWORK_ERROR',
    questions: [
      {
        order: 1,
        content: '자기소개를 해주세요.',
        answered: true,
        answerDurationSeconds: 40,
      },
      {
        order: 2,
        content: '기술 스택을 말씀해 주세요.',
        answered: false,
        answerDurationSeconds: null,
      },
      {
        order: 3,
        content: 'REST API 설계 경험은?',
        answered: false,
        answerDurationSeconds: null,
      },
      {
        order: 4,
        content: '데이터베이스 최적화 경험은?',
        answered: false,
        answerDurationSeconds: null,
      },
      {
        order: 5,
        content: '마무리 한마디.',
        answered: false,
        answerDurationSeconds: null,
      },
    ],
  },
  {
    sessionId: 's445',
    user: { id: 7, nickname: '임서준', email: 'seojun.lim@example.com' },
    jobCategory: '데이터분석',
    careerLevel: null,
    status: 'ERROR',
    progressRate: 5,
    durationSeconds: 220,
    startedAt: '2026-02-20T09:00:00Z',
    endedAt: '2026-02-20T09:03:40Z',
    totalQuestions: 5,
    answeredQuestions: 0,
    interruptReason: 'SYSTEM_ERROR',
    questions: [
      {
        order: 1,
        content: '자기소개를 해주세요.',
        answered: false,
        answerDurationSeconds: null,
      },
      {
        order: 2,
        content: '데이터 분석 경험은?',
        answered: false,
        answerDurationSeconds: null,
      },
      {
        order: 3,
        content: 'SQL 활용 경험은?',
        answered: false,
        answerDurationSeconds: null,
      },
      {
        order: 4,
        content: '시각화 도구 사용 경험은?',
        answered: false,
        answerDurationSeconds: null,
      },
      {
        order: 5,
        content: '마무리 한마디.',
        answered: false,
        answerDurationSeconds: null,
      },
    ],
  },
  {
    sessionId: 's671',
    user: { id: 1, nickname: '강도윤', email: 'doyun.kang@example.com' },
    jobCategory: '프론트엔드',
    careerLevel: null,
    status: 'IN_PROGRESS',
    progressRate: 60,
    durationSeconds: 360,
    startedAt: '2026-02-20T00:00:00Z',
    endedAt: null,
    totalQuestions: 5,
    answeredQuestions: 3,
    interruptReason: null,
    questions: [
      {
        order: 1,
        content: '자기소개를 해주세요.',
        answered: true,
        answerDurationSeconds: 45,
      },
      {
        order: 2,
        content: 'React 사용 경험은?',
        answered: true,
        answerDurationSeconds: 70,
      },
      {
        order: 3,
        content: '성능 최적화 경험은?',
        answered: true,
        answerDurationSeconds: 60,
      },
      {
        order: 4,
        content: '협업 툴 사용 경험은?',
        answered: false,
        answerDurationSeconds: null,
      },
      {
        order: 5,
        content: '마무리 한마디.',
        answered: false,
        answerDurationSeconds: null,
      },
    ],
  },
];

@Injectable()
export class InterviewsService {
  listInterviews(query: ListInterviewsQuery) {
    const status = this.parseStatus(query.status);
    const search = query.search?.trim().toLowerCase();
    const sortBy = query.sortBy ?? 'startedAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));

    const filtered = INTERVIEWS.filter((iv) => {
      if (status && iv.status !== status) return false;
      if (query.jobCategory && iv.jobCategory !== query.jobCategory)
        return false;
      if (search) {
        const matchSession = iv.sessionId.toLowerCase().includes(search);
        const matchUser = iv.user.nickname.toLowerCase().includes(search);
        if (!matchSession && !matchUser) return false;
      }
      if (query.from && iv.startedAt < query.from) return false;
      if (query.to && iv.startedAt > query.to + 'T23:59:59Z') return false;
      return true;
    });

    filtered.sort((a, b) => {
      let left: string | number;
      let right: string | number;
      if (sortBy === 'duration') {
        left = a.durationSeconds;
        right = b.durationSeconds;
      } else if (sortBy === 'progressRate') {
        left = a.progressRate;
        right = b.progressRate;
      } else {
        left = a.startedAt;
        right = b.startedAt;
      }
      if (left === right) return 0;
      return (left > right ? 1 : -1) * (sortOrder === 'asc' ? 1 : -1);
    });

    const interruptedCount = filtered.filter(
      (iv) => iv.status === 'INTERRUPTED' || iv.status === 'ERROR',
    ).length;

    const start = (page - 1) * limit;
    const items: InterviewSummary[] = filtered
      .slice(start, start + limit)
      .map(
        ({
          totalQuestions: _t,
          answeredQuestions: _a,
          interruptReason: _ir,
          questions: _q,
          ...summary
        }) => summary,
      );

    return {
      totalCount: INTERVIEWS.length,
      interruptedCount,
      filteredCount: filtered.length,
      page,
      limit,
      items,
    };
  }

  getInterviewDetail(sessionId: string): InterviewDetail {
    const interview = INTERVIEWS.find((iv) => iv.sessionId === sessionId);
    if (!interview) {
      throw new NotFoundException({
        code: 'INTERVIEW_NOT_FOUND',
        message: '해당 면접 세션을 찾을 수 없습니다.',
      });
    }
    return interview;
  }

  private parseStatus(value?: string): InterviewStatus | undefined {
    if (!value) return undefined;
    const v = value.toUpperCase();
    if (
      v === 'IN_PROGRESS' ||
      v === 'COMPLETED' ||
      v === 'INTERRUPTED' ||
      v === 'ERROR'
    ) {
      return v as InterviewStatus;
    }
    return undefined;
  }
}
