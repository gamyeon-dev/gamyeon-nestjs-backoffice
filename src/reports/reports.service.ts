import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ListReportsQuery,
  ReportDetail,
  ReportStatus,
  ReportSummary,
} from './reports.types';

const REPORTS: ReportDetail[] = [
  {
    reportId: 'r001',
    interviewId: 'i4041',
    user: { id: 2, nickname: '최유진', email: 'yujin.choi@example.com' },
    jobCategory: 'PM',
    status: 'COMPLETED',
    score: 88,
    feedback:
      '전반적으로 PM으로서의 역량이 잘 드러났습니다. 문제 정의와 우선순위 설정에 강점을 보였습니다.',
    questionResults: [
      {
        questionId: 'q01',
        question: '자신의 가장 성공한 프로젝트를 소개해주세요.',
        answer:
          '사용자 온보딩 개선 프로젝트를 주도하여 DAU를 30% 향상시켰습니다.',
        score: 90,
        feedback: '구체적인 수치와 함께 임팩트를 명확히 서술하였습니다.',
      },
    ],
    completedAt: '2026-02-27T15:03:00Z',
    createdAt: '2026-02-27T14:30:00Z',
  },
  {
    reportId: 'r002',
    interviewId: 'i4008',
    user: { id: 3, nickname: '김주윤', email: 'juyoon.kim@example.com' },
    jobCategory: '프로덕트디자인',
    status: 'COMPLETED',
    score: 74,
    feedback:
      '디자인 원칙에 대한 이해는 좋으나 사용자 리서치 경험이 부족합니다.',
    questionResults: [],
    completedAt: '2026-02-27T13:47:00Z',
    createdAt: '2026-02-27T13:00:00Z',
  },
  {
    reportId: 'r003',
    interviewId: 'i3009',
    user: { id: 4, nickname: '이아련', email: 'aryun.lee@example.com' },
    jobCategory: '백엔드',
    status: 'COMPLETED',
    score: 82,
    feedback: '시스템 설계와 알고리즘 역량이 우수합니다.',
    questionResults: [],
    completedAt: '2026-02-27T12:45:00Z',
    createdAt: '2026-02-27T12:00:00Z',
  },
  {
    reportId: 'r004',
    interviewId: 'i3008',
    user: { id: 1, nickname: '강도윤', email: 'doyun.kang@example.com' },
    jobCategory: '백엔드',
    status: 'IN_PROGRESS',
    score: null,
    feedback: null,
    questionResults: [],
    completedAt: '2026-02-27T11:45:00Z',
    createdAt: '2026-02-27T11:00:00Z',
  },
  {
    reportId: 'r005',
    interviewId: 'i5008',
    user: { id: 2, nickname: '최유진', email: 'yujin.choi@example.com' },
    jobCategory: 'PM',
    status: 'COMPLETED',
    score: 19,
    feedback: '답변이 전반적으로 부족했습니다. 직무 역량 강화가 필요합니다.',
    questionResults: [],
    completedAt: '2026-02-24T11:28:00Z',
    createdAt: '2026-02-24T11:00:00Z',
  },
  {
    reportId: 'r006',
    interviewId: 'i4025',
    user: { id: 7, nickname: '함아린', email: 'arin.ham@example.com' },
    jobCategory: null,
    status: 'FAILED',
    score: null,
    feedback: null,
    questionResults: [],
    completedAt: '2026-02-23T09:00:00Z',
    createdAt: '2026-02-23T08:30:00Z',
  },
];

@Injectable()
export class ReportsService {
  listReports(query: ListReportsQuery) {
    const status = this.parseStatus(query.status);
    const search = query.search?.trim().toLowerCase();
    const sortBy = query.sortBy ?? 'completedAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));

    const filtered = REPORTS.filter((r) => {
      const isStatusMatch = status ? r.status === status : true;
      const isSearchMatch = search
        ? r.reportId.toLowerCase().includes(search) ||
          r.user.nickname.toLowerCase().includes(search) ||
          r.interviewId.toLowerCase().includes(search)
        : true;
      return isStatusMatch && isSearchMatch;
    });

    filtered.sort((a, b) => {
      let left: string | number | null;
      let right: string | number | null;

      if (sortBy === 'score') {
        left = a.score ?? -1;
        right = b.score ?? -1;
      } else {
        left = a[sortBy];
        right = b[sortBy];
      }

      if (left === right) return 0;
      return (
        ((left ?? '') > (right ?? '') ? 1 : -1) * (sortOrder === 'asc' ? 1 : -1)
      );
    });

    const start = (page - 1) * limit;
    const items: ReportSummary[] = filtered
      .slice(start, start + limit)
      .map(
        ({ feedback: _f, questionResults: _qr, createdAt: _c, ...summary }) =>
          summary,
      );

    return {
      totalCount: REPORTS.length,
      filteredCount: filtered.length,
      page,
      limit,
      items,
    };
  }

  getReportById(reportId: string): ReportDetail {
    const report = REPORTS.find((r) => r.reportId === reportId);
    if (!report) {
      throw new NotFoundException({
        code: 'REPORT_NOT_FOUND',
        message: '해당 리포트를 찾을 수 없습니다.',
      });
    }
    return report;
  }

  private parseStatus(value?: string): ReportStatus | undefined {
    if (!value) return undefined;
    const v = value.toUpperCase();
    if (v === 'COMPLETED' || v === 'IN_PROGRESS' || v === 'FAILED')
      return v as ReportStatus;
    return undefined;
  }
}
