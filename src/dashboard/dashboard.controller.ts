import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';

@ApiTags('대시보드')
@ApiBearerAuth()
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpi')
  @ApiOperation({ summary: 'KPI 조회' })
  getKpi() {
    return this.dashboardService.getKpi();
  }

  @Get('signup-trend')
  @ApiOperation({ summary: '가입 추이 조회' })
  getSignupTrend(@Query('days') days?: string) {
    const parsedDays = days ? parseInt(days, 10) : 13;
    return this.dashboardService.getSignupTrend(parsedDays);
  }

  @Get('interview-completion')
  @ApiOperation({ summary: '면접 완료율 조회' })
  getInterviewCompletion() {
    return this.dashboardService.getInterviewCompletion();
  }

  @Get('report-analysis')
  @ApiOperation({ summary: '리포트 분석 현황 조회' })
  getReportAnalysis() {
    return this.dashboardService.getReportAnalysis();
  }

  @Get('recent-activities')
  @ApiOperation({ summary: '최근 활동 내역 조회' })
  getRecentActivities(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.dashboardService.getRecentActivities(parsedLimit);
  }

  @Get('summary')
  @ApiOperation({ summary: '대시보드 전체 요약 조회' })
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
