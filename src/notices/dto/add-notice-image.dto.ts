import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class AddNoticeImageDto {
  @ApiProperty({ description: '이미지 URL' })
  @IsString()
  @IsNotEmpty({ message: '이미지 URL을 입력해주세요.' })
  imageUrl!: string;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
