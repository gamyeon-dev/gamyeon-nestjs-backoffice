import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNoticeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  content!: string;
}
