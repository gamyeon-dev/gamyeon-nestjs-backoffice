import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticesController } from './notices.controller.js';
import { NoticesService } from './notices.service.js';
import { NoticeImageStorageService } from './notice-image-storage.service.js';
import { NoticeEntity } from './entities/notice.entity.js';
import { NoticeImageEntity } from './entities/notice-image.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([NoticeEntity, NoticeImageEntity])],
  controllers: [NoticesController],
  providers: [NoticesService, NoticeImageStorageService],
})
export class NoticesModule {}
