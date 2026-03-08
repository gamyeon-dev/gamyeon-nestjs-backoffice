export type InterviewStatus =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'INTERRUPTED'
  | 'ERROR';

export type InterruptReason =
  | 'USER_EXIT'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'SYSTEM_ERROR'
  | null;

export interface InterviewUser {
  id: number;
  nickname: string;
  email?: string;
}

export interface InterviewSummary {
  sessionId: string;
  user: InterviewUser;
  jobCategory: string | null;
  careerLevel: string | null;
  status: InterviewStatus;
  progressRate: number;
  durationSeconds: number;
  startedAt: string;
  endedAt: string | null;
}

export interface InterviewQuestion {
  order: number;
  content: string;
  answered: boolean;
  answerDurationSeconds: number | null;
}

export interface InterviewDetail extends InterviewSummary {
  totalQuestions: number;
  answeredQuestions: number;
  interruptReason: InterruptReason;
  questions: InterviewQuestion[];
}

export interface ListInterviewsQuery {
  status?: InterviewStatus;
  search?: string;
  jobCategory?: string;
  from?: string;
  to?: string;
  sortBy?: 'startedAt' | 'duration' | 'progressRate';
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}
