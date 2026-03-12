export type NoticeStatus = 'ACTIVE' | 'INACTIVE';
export type NoticeType = 'SERVICE' | 'MAINTENANCE' | 'UPDATE' | 'ETC';
export type NoticeCategory = 'UPDATE' | 'GUIDE' | 'MAINTENANCE' | 'EVENT';

export interface NoticeImage {
  id: string;
  url: string;
  caption?: string;
  sortOrder: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  type: NoticeType;
  images: NoticeImage[];
  status: NoticeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListNoticesQuery {
  status?: NoticeStatus;
  type?: NoticeType;
  category?: NoticeCategory;
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
  category?: NoticeCategory;
  type?: NoticeType;
  images?: CreateNoticeImageDto[];
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateNoticeDto {
  title?: string;
  content?: string;
  category?: NoticeCategory;
  type?: NoticeType;
  images?: CreateNoticeImageDto[];
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateNoticeImageDto {
  url: string;
  caption?: string;
  sortOrder?: number;
}
