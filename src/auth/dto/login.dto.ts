import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@gamyeon.com' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password!: string;
}
