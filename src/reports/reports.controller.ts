import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service.js';
import { ListReportsQueryDto } from './dto/list-reports-query.dto.js';

@ApiTags('리포트 관리')
@ApiBearerAuth()
@Controller('api/v1/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: '리포트 목록 조회' })
  listReports(@Query() query: ListReportsQueryDto) {
    return this.reportsService.listReports(query);
  }

  @Get(':reportId')
  @ApiOperation({ summary: '리포트 상세 조회' })
  getReportById(@Param('reportId') reportId: string) {
    return this.reportsService.getReportById(reportId);
  }
}
