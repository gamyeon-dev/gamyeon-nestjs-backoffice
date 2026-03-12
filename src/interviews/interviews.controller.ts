import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service.js';
import { ListInterviewsQueryDto } from './dto/list-interviews-query.dto.js';

@ApiTags('면접 관리')
@ApiBearerAuth()
@Controller('api/v1/interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get()
  @ApiOperation({ summary: '면접 목록 조회' })
  listInterviews(@Query() query: ListInterviewsQueryDto) {
    return this.interviewsService.listInterviews(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '면접 상세 조회' })
  getInterviewById(@Param('id', ParseIntPipe) id: number) {
    return this.interviewsService.getInterviewById(id);
  }
}
