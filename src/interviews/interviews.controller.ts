import { Controller, Get, Param, Query } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import type { ListInterviewsQuery } from './interviews.types';

@Controller('api/v1/interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get()
  listInterviews(@Query() query: ListInterviewsQuery) {
    return this.interviewsService.listInterviews(query);
  }

  @Get(':sessionId')
  getInterviewDetail(@Param('sessionId') sessionId: string) {
    return this.interviewsService.getInterviewDetail(sessionId);
  }
}
