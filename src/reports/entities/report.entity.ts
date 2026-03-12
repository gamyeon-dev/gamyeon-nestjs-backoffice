import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity.js';
import { InterviewEntity } from '../../interviews/entities/interview.entity.js';
import { QuestionResultEntity } from './question-result.entity.js';

export type ReportStatus = 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';

@Entity('reports')
export class ReportEntity {
  @PrimaryColumn({ name: 'report_id' })
  reportId!: string;

  @Column({ name: 'interview_id', type: 'bigint' })
  interviewId!: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @Column({ name: 'job_category', nullable: true })
  jobCategory!: string | null;

  @Column({
    type: 'enum',
    enum: ['COMPLETED', 'IN_PROGRESS', 'FAILED'],
  })
  status!: ReportStatus;

  @Column({ type: 'float', nullable: true })
  score!: number | null;

  @Column({ type: 'text', nullable: true })
  feedback!: string | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => InterviewEntity)
  @JoinColumn({ name: 'interview_id' })
  interview!: InterviewEntity;

  @OneToMany(() => QuestionResultEntity, (qr) => qr.report, { eager: true })
  questionResults!: QuestionResultEntity[];
}
