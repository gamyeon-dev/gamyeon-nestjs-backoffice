import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InterviewsModule } from './interviews/interviews.module';
import { NoticesModule } from './notices/notices.module';
import { QuestionsModule } from './questions/questions.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    DashboardModule,
    UsersModule,
    ReportsModule,
    QuestionsModule,
    NoticesModule,
    InterviewsModule,
  ],
})
export class AppModule {}
