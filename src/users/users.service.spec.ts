import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
  });

  it('returns user summaries with required fields', () => {
    const result = service.listUsers({});

    expect(result.totalCount).toBe(8);
    expect(result.filteredCount).toBe(8);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        sessionCount: expect.any(Number),
        lastActiveAt: expect.any(String),
        joinedAt: expect.any(String),
      }),
    );
  });

  it('filters by status and search text', () => {
    const result = service.listUsers({
      status: 'WARNING',
      search: 'seojun',
    });

    expect(result.filteredCount).toBe(1);
    expect(result.items[0]?.nickname).toBe('임서준');
  });
});
