import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import type {
  CreateQuestionDto,
  ListQuestionsQuery,
  UpdateQuestionDto,
} from './questions.types';

@Controller('api/v1/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  listQuestions(@Query() query: ListQuestionsQuery) {
    return this.questionsService.listQuestions(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.questionsService.createQuestion(dto);
  }

  @Patch(':id')
  updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.questionsService.updateQuestion(id, dto);
  }

  @Delete(':id')
  deleteQuestion(@Param('id') id: string) {
    return this.questionsService.deleteQuestion(id);
  }
}
