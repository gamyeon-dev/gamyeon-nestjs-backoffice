import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(
    dto: LoginDto,
  ): Promise<{
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
    refreshExpiresIn: number;
  }> {
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

    return this.issueTokens();
  }

  refresh(refreshToken: string) {
    const refreshSecret =
      process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'fallback-secret';

    let payload: { sub: string; role: string; type?: string };
    try {
      payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: '리프레시 토큰이 유효하지 않습니다.',
      });
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: '리프레시 토큰이 유효하지 않습니다.',
      });
    }

    return this.issueTokens();
  }

  getMe(): { email: string; role: string } {
    return {
      email: process.env.ADMIN_EMAIL ?? '',
      role: 'SUPER_ADMIN',
    };
  }

  private issueTokens() {
    const accessPayload = { sub: 'super_admin', role: 'SUPER_ADMIN' };
    const refreshPayload = {
      sub: 'super_admin',
      role: 'SUPER_ADMIN',
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload);
    const refreshSecret =
      process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'fallback-secret';
    const refreshExpiresIn = this.parseExpiresIn(
      process.env.JWT_REFRESH_EXPIRES_IN ?? '14d',
    );
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    const expiresIn = this.parseExpiresIn(process.env.JWT_EXPIRES_IN ?? '8h');

    return { accessToken, expiresIn, refreshToken, refreshExpiresIn };
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
