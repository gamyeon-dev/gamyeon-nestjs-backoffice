export type NoticeStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type NoticeType = 'SERVICE' | 'MAINTENANCE' | 'UPDATE' | 'ETC';

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: NoticeType;
  status: NoticeStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ListNoticesQuery {
  status?: NoticeStatus;
  type?: NoticeType;
  search?: string;
  from?: string;
  to?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}

export interface CreateNoticeDto {
  title: string;
  content: string;
  type?: NoticeType;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateNoticeDto {
  title?: string;
  content?: string;
  type?: NoticeType;
  status?: 'ACTIVE' | 'INACTIVE';
}
