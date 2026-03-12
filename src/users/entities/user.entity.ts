import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SanctionEntity } from './sanction.entity.js';

export type UserStatus = 'ACTIVE' | 'WARNED' | 'BANNED' | 'WITHDREW';
export type UserProvider = 'GOOGLE' | 'KAKAO';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ unique: true, type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar', length: 8 })
  nickname!: string;

  @Column({
    type: 'varchar',
    enum: ['GOOGLE', 'KAKAO'],
  })
  provider!: UserProvider;

  @Column({ name: 'provider_id', type: 'varchar' })
  providerId!: string;

  @Column({
    type: 'varchar',
    enum: ['ACTIVE', 'WARNED', 'BANNED', 'WITHDREW'],
    default: 'ACTIVE',
  })
  status!: UserStatus;

  @Column({ name: 'withdrawn_at', type: 'timestamp', nullable: true })
  withdrawnAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => SanctionEntity, (s) => s.user)
  sanctions!: SanctionEntity[];
}
