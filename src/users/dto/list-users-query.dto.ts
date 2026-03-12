import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['ACTIVE', 'WARNED', 'BANNED', 'WITHDREW'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'WARNED', 'BANNED', 'WITHDREW'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['createdAt', 'updatedAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  sortBy: 'createdAt' | 'updatedAt' = 'createdAt';
}
