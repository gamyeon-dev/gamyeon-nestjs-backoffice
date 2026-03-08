export type UserStatus = 'ACTIVE' | 'WARNING' | 'SUSPENDED';

export interface Sanction {
  id: string;
  type: UserStatus;
  reason: string | null;
  createdAt: string;
}

export interface UserSummary {
  id: number;
  nickname: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  sessionCount: number;
  lastActiveAt: string;
  joinedAt: string;
}

export interface UserDetail extends UserSummary {
  sanctions: Sanction[];
}

export interface ListUsersQuery {
  search?: string;
  status?: UserStatus;
  sortBy?: 'joinedAt' | 'lastActiveAt' | 'sessionCount';
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}

export interface UpdateUserStatusDto {
  status: UserStatus;
  reason?: string;
}
