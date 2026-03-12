import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Express } from 'express';
import { NoticesService } from './notices.service.js';
import { ListNoticesQueryDto } from './dto/list-notices-query.dto.js';
import { CreateNoticeDto } from './dto/create-notice.dto.js';
import { UpdateNoticeDto } from './dto/update-notice.dto.js';
import { AddNoticeImageDto } from './dto/add-notice-image.dto.js';

@ApiTags('공지사항 관리')
@ApiBearerAuth()
@Controller('api/v1/notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  @ApiOperation({ summary: '공지사항 목록 조회' })
  listNotices(@Query() query: ListNoticesQueryDto) {
    return this.noticesService.listNotices(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '공지사항 상세 조회' })
  getNoticeById(@Param('id', ParseIntPipe) id: number) {
    return this.noticesService.getNoticeById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '공지사항 생성' })
  createNotice(@Body() dto: CreateNoticeDto) {
    return this.noticesService.createNotice(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '공지사항 수정' })
  updateNotice(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNoticeDto,
  ) {
    return this.noticesService.updateNotice(id, dto);
  }

  @Post(':id/images')
  @ApiOperation({ summary: '공지사항 이미지 추가 (URL)' })
  addNoticeImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddNoticeImageDto,
  ) {
    return this.noticesService.addNoticeImage(id, dto);
  }

  @Post(':id/images/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '공지사항 이미지 업로드 (파일)' })
  async uploadNoticeImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('sortOrder') sortOrder?: string,
  ) {
    const parsedSortOrder =
      sortOrder === undefined ? undefined : Number.parseInt(sortOrder, 10);
    return this.noticesService.uploadNoticeImage(id, file, {
      sortOrder: Number.isNaN(parsedSortOrder) ? undefined : parsedSortOrder,
    });
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: '공지사항 이미지 삭제' })
  removeNoticeImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.noticesService.removeNoticeImage(id, imageId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '공지사항 삭제' })
  deleteNotice(@Param('id', ParseIntPipe) id: number) {
    return this.noticesService.deleteNotice(id);
  }
}
