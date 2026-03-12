import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'WARNED', 'BANNED', 'WITHDREW'] })
  @IsIn(['ACTIVE', 'WARNED', 'BANNED', 'WITHDREW'])
  status!: 'ACTIVE' | 'WARNED' | 'BANNED' | 'WITHDREW';

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
