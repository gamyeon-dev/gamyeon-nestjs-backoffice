import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpi')
  getKpi() {
    return this.dashboardService.getKpi();
  }

  @Get('signup-trend')
  getSignupTrend(@Query('days') days?: string) {
    const parsedDays = days ? parseInt(days, 10) : 13;
    return this.dashboardService.getSignupTrend(parsedDays);
  }

  @Get('interview-completion')
  getInterviewCompletion() {
    return this.dashboardService.getInterviewCompletion();
  }

  @Get('report-analysis')
  getReportAnalysis() {
    return this.dashboardService.getReportAnalysis();
  }

  @Get('recent-activities')
  getRecentActivities(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.dashboardService.getRecentActivities(parsedLimit);
  }

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
