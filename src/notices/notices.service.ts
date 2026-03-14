import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Express } from 'express';
import { NoticeEntity } from './entities/notice.entity.js';
import { NoticeImageEntity } from './entities/notice-image.entity.js';
import { NoticeImageStorageService } from './notice-image-storage.service.js';
import { ListNoticesQueryDto } from './dto/list-notices-query.dto.js';
import { CreateNoticeDto } from './dto/create-notice.dto.js';
import { UpdateNoticeDto } from './dto/update-notice.dto.js';
import { AddNoticeImageDto } from './dto/add-notice-image.dto.js';
import {
  DEFAULT_NOTICE_CATEGORY,
  DEFAULT_NOTICE_STATUS,
} from './notices.constants.js';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(NoticeEntity)
    private readonly noticeRepo: Repository<NoticeEntity>,
    @InjectRepository(NoticeImageEntity)
    private readonly noticeImageRepo: Repository<NoticeImageEntity>,
    private readonly noticeImageStorageService: NoticeImageStorageService,
  ) {}

  async listNotices(query: ListNoticesQueryDto) {
    const { page = 1, limit = 20, sortOrder = 'desc' } = query;
    const sortBy = query.sortBy ?? 'createdAt';

    const qb = this.noticeRepo.createQueryBuilder('notice');

    if (query.search) {
      qb.andWhere(
        '(notice.title ILIKE :search OR notice.content ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.category) {
      qb.andWhere('notice.category = :category', { category: query.category });
    }
    if (query.status) {
      qb.andWhere('notice.status = :status', { status: query.status });
    }

    if (query.from) {
      qb.andWhere('notice.created_at >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('notice.created_at <= :to', {
        to: query.to + 'T23:59:59',
      });
    }

    const totalCount = await this.noticeRepo.count();

    qb.orderBy(
      `notice.${sortBy === 'updatedAt' ? 'updated_at' : 'created_at'}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );
    qb.skip((page - 1) * limit).take(limit);

    const [items, filteredCount] = await qb.getManyAndCount();

    return { totalCount, filteredCount, page, limit, items };
  }

  async getNoticeById(id: number): Promise<NoticeEntity> {
    const notice = await this.noticeRepo.findOne({
      where: { id },
      relations: ['images'],
    });
    if (!notice) {
      throw new NotFoundException({
        code: 'NOTICE_NOT_FOUND',
        message: '해당 공지사항을 찾을 수 없습니다.',
      });
    }
    return notice;
  }

  async createNotice(dto: CreateNoticeDto): Promise<NoticeEntity> {
    const notice = this.noticeRepo.create({
      title: dto.title.trim(),
      content: dto.content.trim(),
      category: dto.category ?? DEFAULT_NOTICE_CATEGORY,
      status: dto.status ?? DEFAULT_NOTICE_STATUS,
    });
    return this.noticeRepo.save(notice);
  }

  async updateNotice(id: number, dto: UpdateNoticeDto): Promise<NoticeEntity> {
    const notice = await this.getNoticeById(id);

    if (dto.title !== undefined) notice.title = dto.title.trim();
    if (dto.content !== undefined) notice.content = dto.content.trim();
    if (dto.category !== undefined) notice.category = dto.category;
    if (dto.status !== undefined) notice.status = dto.status;

    return this.noticeRepo.save(notice);
  }

  async addNoticeImage(
    id: number,
    dto: AddNoticeImageDto,
  ): Promise<NoticeEntity> {
    const notice = await this.getNoticeById(id);

    const image = this.noticeImageRepo.create({
      noticeId: notice.id,
      imageUrl: dto.imageUrl.trim(),
      sortOrder: dto.sortOrder ?? notice.images.length,
    });
    await this.noticeImageRepo.save(image);

    return this.getNoticeById(id);
  }

  async uploadNoticeImage(
    id: number,
    file: Express.Multer.File,
    meta: { sortOrder?: number },
  ): Promise<NoticeEntity> {
    const notice = await this.getNoticeById(id);

    const uploaded = await this.noticeImageStorageService.uploadNoticeImage(
      id,
      file,
    );

    const image = this.noticeImageRepo.create({
      noticeId: notice.id,
      imageUrl: uploaded.url,
      sortOrder: meta.sortOrder ?? notice.images.length,
    });
    await this.noticeImageRepo.save(image);

    return this.getNoticeById(id);
  }

  async removeNoticeImage(id: number, imageId: number): Promise<NoticeEntity> {
    await this.getNoticeById(id);

    const result = await this.noticeImageRepo.delete({
      id: imageId,
      noticeId: id,
    });
    if (result.affected === 0) {
      throw new NotFoundException({
        code: 'NOTICE_IMAGE_NOT_FOUND',
        message: '해당 공지 이미지가 존재하지 않습니다.',
      });
    }

    return this.getNoticeById(id);
  }

  async deleteNotice(id: number) {
    const result = await this.noticeRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException({
        code: 'NOTICE_NOT_FOUND',
        message: '해당 공지사항을 찾을 수 없습니다.',
      });
    }
    return { id };
  }
}
