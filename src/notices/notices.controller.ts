import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NoticesService } from './notices.service';
import type {
  CreateNoticeDto,
  ListNoticesQuery,
  UpdateNoticeDto,
} from './notices.types';

@Controller('api/v1/notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  listNotices(@Query() query: ListNoticesQuery) {
    return this.noticesService.listNotices(query);
  }

  @Get(':id')
  getNoticeById(@Param('id') id: string) {
    return this.noticesService.getNoticeById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createNotice(@Body() dto: CreateNoticeDto) {
    return this.noticesService.createNotice(dto);
  }

  @Patch(':id')
  updateNotice(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return this.noticesService.updateNotice(id, dto);
  }

  @Delete(':id')
  deleteNotice(@Param('id') id: string) {
    return this.noticesService.deleteNotice(id);
  }
}
