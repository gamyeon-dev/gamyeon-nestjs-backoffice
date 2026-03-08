import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ListUsersQuery,
  Sanction,
  UpdateUserStatusDto,
  UserDetail,
  UserRecord,
  UserStatus,
  UserSummary,
} from './users.types';

function stripPasswordHash(user: UserRecord): UserSummary {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

const USERS: UserRecord[] = [
  {
    id: 1,
    nickname: '강도윤',
    email: 'doyun.kang@example.com',
    passwordHash: '$2b$12$tQYVwi1zPaGwBo3MxKtPOuVqR8sNdEfGhIjKlMnOpQrStUvWxYz',
    status: 'ACTIVE',
    sessionCount: 12,
    lastActiveAt: '2026-02-27',
    joinedAt: '2026-02-14',
  },
  {
    id: 2,
    nickname: '최유진',
    email: 'yujin.choi@example.com',
    passwordHash: '$2b$12$RoTtU9xNyEuZmAbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEeFf',
    status: 'ACTIVE',
    sessionCount: 31,
    lastActiveAt: '2026-02-27',
    joinedAt: '2026-02-01',
  },
  {
    id: 3,
    nickname: '윤하은',
    email: 'haeun.yoon@example.com',
    passwordHash: '$2b$12$UrliwX2a0bHxCpDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVv',
    status: 'ACTIVE',
    sessionCount: 9,
    lastActiveAt: '2026-02-25',
    joinedAt: '2026-01-28',
  },
  {
    id: 4,
    nickname: '이서연',
    email: 'seoyeon.lee@example.com',
    passwordHash: '$2b$12$PmNqR7vLwCsXkYzAbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEe',
    status: 'ACTIVE',
    sessionCount: 18,
    lastActiveAt: '2026-02-26',
    joinedAt: '2026-01-12',
  },
  {
    id: 5,
    nickname: '김민준',
    email: 'minjun.kim@example.com',
    passwordHash: '$2b$12$LxZaHvM9kGpZJAbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEeFf',
    status: 'ACTIVE',
    sessionCount: 24,
    lastActiveAt: '2026-02-27',
    joinedAt: '2026-01-05',
  },
  {
    id: 6,
    nickname: '박준혁',
    email: 'junhyuk.park@example.com',
    passwordHash: '$2b$12$QnOsS8wMxDtY1AbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEeFf',
    status: 'WARNING',
    sessionCount: 7,
    lastActiveAt: '2026-02-24',
    joinedAt: '2025-12-20',
  },
  {
    id: 7,
    nickname: '임서준',
    email: 'seojun.lim@example.com',
    passwordHash: '$2b$12$VsXxY3bRc1yDqAbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEeFf',
    status: 'WARNING',
    sessionCount: 5,
    lastActiveAt: '2026-02-22',
    joinedAt: '2025-12-05',
  },
  {
    id: 8,
    nickname: '정다현',
    email: 'dahyun.jung@example.com',
    passwordHash: '$2b$12$SpUuV0y0zFvAnAbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEeFf',
    status: 'SUSPENDED',
    sessionCount: 3,
    lastActiveAt: '2026-02-10',
    joinedAt: '2025-11-15',
  },
];

const SANCTIONS: Map<number, Sanction[]> = new Map([
  [
    6,
    [
      {
        id: 'sanction_001',
        type: 'WARNING',
        reason: '반복적인 부적절한 답변',
        createdAt: '2026-02-10T09:00:00Z',
      },
    ],
  ],
  [
    8,
    [
      {
        id: 'sanction_002',
        type: 'WARNING',
        reason: '반복적인 부적절한 답변',
        createdAt: '2026-01-20T09:00:00Z',
      },
      {
        id: 'sanction_003',
        type: 'SUSPENDED',
        reason: '서비스 약관 위반',
        createdAt: '2026-02-01T14:00:00Z',
      },
    ],
  ],
]);

@Injectable()
export class UsersService {
  listUsers(query: ListUsersQuery) {
    const search = query.search?.trim().toLowerCase();
    const status = this.parseStatus(query.status);
    const sortBy = query.sortBy ?? 'joinedAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));

    const filtered = USERS.filter((user) => {
      const isStatusMatch = status ? user.status === status : true;
      const isSearchMatch = search
        ? user.nickname.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
        : true;
      return isStatusMatch && isSearchMatch;
    });

    filtered.sort((a, b) => {
      const left = a[sortBy];
      const right = b[sortBy];
      if (left === right) return 0;
      return (left > right ? 1 : -1) * (sortOrder === 'asc' ? 1 : -1);
    });

    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit).map(stripPasswordHash);

    return {
      totalCount: USERS.length,
      filteredCount: filtered.length,
      page,
      limit,
      items,
    };
  }

  getUserById(id: number): UserDetail {
    const user = USERS.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '해당 유저를 찾을 수 없습니다.',
      });
    }
    return { ...stripPasswordHash(user), sanctions: SANCTIONS.get(id) ?? [] };
  }

  updateUserStatus(id: number, dto: UpdateUserStatusDto) {
    const user = USERS.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '해당 유저를 찾을 수 없습니다.',
      });
    }

    this.validateStatusTransition(user.status, dto.status);

    user.status = dto.status;

    const sanctions = SANCTIONS.get(id) ?? [];
    sanctions.push({
      id: `sanction_${Date.now()}`,
      type: dto.status,
      reason: dto.reason ?? null,
      createdAt: new Date().toISOString(),
    });
    SANCTIONS.set(id, sanctions);

    return {
      id: user.id,
      status: user.status,
      updatedAt: new Date().toISOString(),
    };
  }

  getUserSanctions(id: number) {
    const user = USERS.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '해당 유저를 찾을 수 없습니다.',
      });
    }
    return { items: SANCTIONS.get(id) ?? [] };
  }

  private validateStatusTransition(
    current: UserStatus,
    next: UserStatus,
  ): void {
    if (current === next) {
      const labels: Record<UserStatus, string> = {
        ACTIVE: '활동',
        WARNING: '경고',
        SUSPENDED: '정지',
      };
      throw new BadRequestException({
        code: 'INVALID_STATUS_TRANSITION',
        message: `이미 ${labels[current]} 상태인 유저입니다.`,
      });
    }

    if (current === 'SUSPENDED' && next === 'WARNING') {
      throw new BadRequestException({
        code: 'INVALID_STATUS_TRANSITION',
        message:
          '정지 상태에서 경고로 직접 변경할 수 없습니다. 먼저 활동 복구 후 경고를 부여하세요.',
      });
    }
  }

  private parseStatus(value?: string): UserStatus | undefined {
    if (!value) return undefined;
    const v = value.toUpperCase();
    if (v === 'ACTIVE' || v === 'WARNING' || v === 'SUSPENDED') return v;
    return undefined;
  }
}
