import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { ListReportsQuery } from './reports.types';

@Controller('api/v1/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  listReports(@Query() query: ListReportsQuery) {
    return this.reportsService.listReports(query);
  }

  @Get(':reportId')
  getReportById(@Param('reportId') reportId: string) {
    return this.reportsService.getReportById(reportId);
  }
}
