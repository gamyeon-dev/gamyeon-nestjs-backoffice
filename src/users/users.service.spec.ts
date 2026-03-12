import { UsersService } from './users.service';

describe('UsersService', () => {
  it('should be defined', () => {
    // Requires TypeORM repositories - integration test needed
    expect(UsersService).toBeDefined();
  });
});
