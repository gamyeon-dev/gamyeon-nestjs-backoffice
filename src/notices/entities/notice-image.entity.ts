import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NoticeEntity } from './notice.entity.js';

@Entity('notice_images')
export class NoticeImageEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'notice_id', type: 'bigint' })
  noticeId!: number;

  @Column({ name: 'image_url', type: 'varchar' })
  imageUrl!: string;

  @Column({ name: 'sort_order', type: 'int' })
  sortOrder!: number;

  @ManyToOne(() => NoticeEntity, (n) => n.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notice_id' })
  notice!: NoticeEntity;
}
