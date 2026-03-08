import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import type { ListUsersQuery, UpdateUserStatusDto } from './users.types';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  listUsers(@Query() query: ListUsersQuery) {
    return this.usersService.listUsers(query);
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(parseInt(id, 10));
  }

  @Patch(':id/status')
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.usersService.updateUserStatus(parseInt(id, 10), dto);
  }

  @Get(':id/sanctions')
  getUserSanctions(@Param('id') id: string) {
    return this.usersService.getUserSanctions(parseInt(id, 10));
  }
}
