import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class UpdateQuestionDto {
  @ApiPropertyOptional({ minLength: 10 })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: '질문 내용은 최소 10자 이상이어야 합니다.' })
  content?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
