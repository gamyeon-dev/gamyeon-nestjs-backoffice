import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateNoticeDto,
  ListNoticesQuery,
  Notice,
  NoticeStatus,
  NoticeType,
  UpdateNoticeDto,
} from './notices.types';

const NOTICES: Notice[] = [
  {
    id: 'n001',
    title: '서비스 이용약관 변경 안내',
    content:
      '안녕하세요. 가면 서비스 이용약관이 변경되었습니다. 변경 내용은 다음과 같습니다. 주요 변경 사항으로는 개인정보 처리 방침 업데이트 및 서비스 이용 범위 명확화가 포함됩니다.',
    type: 'SERVICE',
    status: 'ACTIVE',
    createdAt: '2026-02-25T00:00:00Z',
    updatedAt: '2026-02-25T00:00:00Z',
  },
  {
    id: 'n002',
    title: '1분 만에 점검 안내',
    content:
      '2026년 2월 25일 오전 2시부터 3시까지 서버 점검이 진행됩니다. 점검 중에는 서비스 이용이 제한됩니다.',
    type: 'MAINTENANCE',
    status: 'INACTIVE',
    createdAt: '2026-02-25T00:00:00Z',
    updatedAt: '2026-02-25T00:00:00Z',
  },
  {
    id: 'n003',
    title: '사기오토 기능 추가 안내',
    content:
      '새로운 AI 면접 분석 기능이 추가되었습니다. 이제 면접 후 더욱 상세한 피드백을 받을 수 있습니다.',
    type: 'UPDATE',
    status: 'ACTIVE',
    createdAt: '2026-01-21T00:00:00Z',
    updatedAt: '2026-01-21T00:00:00Z',
  },
  {
    id: 'n004',
    title: '신규 백업 점검 주가 안내',
    content:
      '서비스 안정성 향상을 위해 매주 일요일 오전 3시에 정기 백업 점검을 실시합니다.',
    type: 'MAINTENANCE',
    status: 'ACTIVE',
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-08T00:00:00Z',
  },
  {
    id: 'n005',
    title: '앱별 서비스 정점 안내',
    content: '각 플랫폼별 서비스 이용 가이드가 업데이트되었습니다.',
    type: 'SERVICE',
    status: 'INACTIVE',
    createdAt: '2026-01-07T00:00:00Z',
    updatedAt: '2026-01-07T00:00:00Z',
  },
];

let nextId = NOTICES.length + 1;

@Injectable()
export class NoticesService {
  listNotices(query: ListNoticesQuery) {
    const status = this.parseStatus(query.status);
    const type = this.parseType(query.type);
    const search = query.search?.trim().toLowerCase();
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));

    const filtered = NOTICES.filter((n) => {
      if (status && n.status !== status) return false;
      if (type && n.type !== type) return false;
      if (
        search &&
        !n.title.toLowerCase().includes(search) &&
        !n.content.toLowerCase().includes(search)
      )
        return false;
      if (query.from && n.createdAt < query.from) return false;
      if (query.to && n.createdAt > query.to + 'T23:59:59Z') return false;
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
      totalCount: NOTICES.length,
      filteredCount: filtered.length,
      page,
      limit,
      items: filtered.slice(start, start + limit),
    };
  }

  getNoticeById(id: string): Notice {
    const notice = NOTICES.find((n) => n.id === id);
    if (!notice) {
      throw new NotFoundException({
        code: 'NOTICE_NOT_FOUND',
        message: '해당 공지사항을 찾을 수 없습니다.',
      });
    }
    return notice;
  }

  createNotice(dto: CreateNoticeDto): Notice {
    if (!dto.title?.trim()) {
      throw new BadRequestException({
        code: 'INVALID_TITLE',
        message: '제목을 입력해주세요.',
      });
    }
    if (!dto.content?.trim()) {
      throw new BadRequestException({
        code: 'INVALID_CONTENT',
        message: '내용을 입력해주세요.',
      });
    }
    const now = new Date().toISOString();
    const notice: Notice = {
      id: `n${String(nextId++).padStart(3, '0')}`,
      title: dto.title.trim(),
      content: dto.content.trim(),
      type: dto.type ?? 'ETC',
      status: dto.status ?? 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    NOTICES.push(notice);
    return notice;
  }

  updateNotice(id: string, dto: UpdateNoticeDto): Notice {
    const notice = NOTICES.find((n) => n.id === id);
    if (!notice) {
      throw new NotFoundException({
        code: 'NOTICE_NOT_FOUND',
        message: '해당 공지사항을 찾을 수 없습니다.',
      });
    }
    if (notice.status === 'DELETED') {
      throw new BadRequestException({
        code: 'NOTICE_DELETED',
        message: '삭제된 공지사항은 수정할 수 없습니다.',
      });
    }
    if (dto.title !== undefined) notice.title = dto.title.trim();
    if (dto.content !== undefined) notice.content = dto.content.trim();
    if (dto.type !== undefined) notice.type = dto.type;
    if (dto.status !== undefined) notice.status = dto.status;
    notice.updatedAt = new Date().toISOString();
    return notice;
  }

  deleteNotice(id: string) {
    const notice = NOTICES.find((n) => n.id === id);
    if (!notice) {
      throw new NotFoundException({
        code: 'NOTICE_NOT_FOUND',
        message: '해당 공지사항을 찾을 수 없습니다.',
      });
    }
    if (notice.status === 'DELETED') {
      throw new BadRequestException({
        code: 'ALREADY_DELETED',
        message: '이미 삭제된 공지사항입니다.',
      });
    }
    const deletedAt = new Date().toISOString();
    notice.status = 'DELETED';
    notice.updatedAt = deletedAt;
    notice.deletedAt = deletedAt;
    return { id: notice.id, status: notice.status, deletedAt };
  }

  private parseStatus(value?: string): NoticeStatus | undefined {
    if (!value) return undefined;
    const v = value.toUpperCase();
    if (v === 'ACTIVE' || v === 'INACTIVE' || v === 'DELETED')
      return v as NoticeStatus;
    return undefined;
  }

  private parseType(value?: string): NoticeType | undefined {
    if (!value) return undefined;
    const v = value.toUpperCase();
    if (v === 'SERVICE' || v === 'MAINTENANCE' || v === 'UPDATE' || v === 'ETC')
      return v as NoticeType;
    return undefined;
  }
}
