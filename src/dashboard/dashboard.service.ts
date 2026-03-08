import { Injectable } from '@nestjs/common';
import type {
  KpiResponse,
  SignupTrendResponse,
  InterviewCompletionResponse,
  ReportAnalysisResponse,
  RecentActivitiesResponse,
  DashboardSummaryResponse,
  ActivityItem,
} from './dashboard.types';

@Injectable()
export class DashboardService {
  getKpi(): KpiResponse {
    return {
      totalUsers: { value: 3481, changeRate: 4.2, changeDirection: 'up' },
      activeQuestions: { value: 8, changeRate: 0, changeDirection: 'neutral' },
      activeNotices: { value: 3, changeRate: 0, changeDirection: 'neutral' },
      interruptedInterviewsToday: {
        value: 18,
        changeRate: -12.5,
        changeDirection: 'down',
      },
      analyzingReports: {
        value: 1,
        changeRate: -66.7,
        changeDirection: 'down',
      },
    };
  }

  getSignupTrend(days: number = 13): SignupTrendResponse {
    const today = new Date('2026-02-27');
    const counts = [82, 88, 91, 77, 55, 95, 110, 115, 125, 130, 138, 141, 135];

    const items = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0]!,
        count: counts[i % counts.length] ?? 80,
      };
    });

    return {
      period: `최근 ${days}일`,
      items,
    };
  }

  getInterviewCompletion(): InterviewCompletionResponse {
    return {
      completionRate: 68,
      segments: [
        { label: '완료', count: 68, percentage: 68 },
        { label: '진행중', count: 15, percentage: 15 },
        { label: '이탈', count: 17, percentage: 17 },
      ],
    };
  }

  getReportAnalysis(): ReportAnalysisResponse {
    return {
      completionRate: 75,
      totalCount: 8,
      segments: [
        { label: '분석 완료', count: 6, percentage: 75 },
        { label: '분석 중', count: 1, percentage: 12.5 },
        { label: '실패', count: 1, percentage: 12.5 },
      ],
    };
  }

  getRecentActivities(limit: number = 20): RecentActivitiesResponse {
    const baseTime = new Date('2026-02-27T10:30:00Z');

    const rawItems: Omit<ActivityItem, 'relativeTime'>[] = [
      {
        id: 'act_001',
        type: 'USER_JOINED',
        message: '새 유저 한지호님이 가입했습니다',
        createdAt: new Date(baseTime.getTime()).toISOString(),
      },
      {
        id: 'act_002',
        type: 'REPORT_COMPLETED',
        message: '최유진님의 PM 면접 리포트 분석이 완료되었습니다',
        createdAt: new Date(baseTime.getTime() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: 'act_003',
        type: 'INTERVIEW_INTERRUPTED',
        message: '문하은님이 면접을 중단했습니다 (2/5 진행)',
        createdAt: new Date(baseTime.getTime() - 18 * 60 * 1000).toISOString(),
      },
      {
        id: 'act_004',
        type: 'NOTICE_CREATED',
        message: "공지사항 '서비스 이용약관 개정 안내'가 등록되었습니다",
        createdAt: new Date(baseTime.getTime() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'act_005',
        type: 'REPORT_STARTED',
        message: '강도윤님의 백엔드 면접 리포트 분석이 시작되었습니다',
        createdAt: new Date(
          baseTime.getTime() - 2 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ];

    const items: ActivityItem[] = rawItems.slice(0, limit).map((item) => ({
      ...item,
      relativeTime: this.toRelativeTime(item.createdAt),
    }));

    return { items };
  }

  getSummary(): DashboardSummaryResponse {
    return {
      kpi: this.getKpi(),
      signupTrend: this.getSignupTrend(),
      interviewCompletion: this.getInterviewCompletion(),
      reportAnalysis: this.getReportAnalysis(),
      recentActivities: this.getRecentActivities(),
    };
  }

  private toRelativeTime(isoString: string): string {
    const now = new Date('2026-02-27T10:30:00Z');
    const past = new Date(isoString);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return '방금 전';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
    return `${Math.floor(diffSec / 86400)}일 전`;
  }
}
