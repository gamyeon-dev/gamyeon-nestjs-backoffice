import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('사용자 관리')
@ApiBearerAuth()
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '사용자 목록 조회' })
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.usersService.listUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '사용자 상세 조회' })
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '사용자 상태 변경' })
  updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(id, dto);
  }

  @Get(':id/sanctions')
  @ApiOperation({ summary: '사용자 제재 이력 조회' })
  getUserSanctions(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserSanctions(id);
  }
}
