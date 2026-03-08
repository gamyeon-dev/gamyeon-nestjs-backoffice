import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    const isEmailMatch = dto.email === adminEmail;
    const isPasswordMatch = adminPasswordHash
      ? await bcrypt.compare(dto.password, adminPasswordHash)
      : dto.password === process.env.ADMIN_PASSWORD;

    if (!isEmailMatch || !isPasswordMatch) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const payload = { sub: 'super_admin', role: 'SUPER_ADMIN' };
    const accessToken = this.jwtService.sign(payload);

    const expiresIn = this.parseExpiresIn(process.env.JWT_EXPIRES_IN ?? '8h');

    return { accessToken, expiresIn };
  }

  getMe(): { email: string; role: string } {
    return {
      email: process.env.ADMIN_EMAIL ?? '',
      role: 'SUPER_ADMIN',
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 28800;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return value * (multipliers[unit] ?? 1);
  }
}
