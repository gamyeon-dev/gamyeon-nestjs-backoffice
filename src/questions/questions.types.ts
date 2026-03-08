export type QuestionStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface Question {
  id: string;
  content: string;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ListQuestionsQuery {
  status?: QuestionStatus;
  search?: string;
  from?: string;
  to?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}

export interface CreateQuestionDto {
  content: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateQuestionDto {
  content?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
