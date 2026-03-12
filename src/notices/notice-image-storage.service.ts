import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import type { Express } from 'express';

interface UploadResult {
  url: string;
  key: string;
}

@Injectable()
export class NoticeImageStorageService {
  private readonly bucket?: string;
  private readonly publicBaseUrl?: string;
  private readonly s3Client?: S3Client;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('S3_REGION') ?? 'ap-northeast-2';
    const bucket = this.configService.get<string>('S3_BUCKET');
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY');
    this.publicBaseUrl = this.configService.get<string>('S3_PUBLIC_BASE_URL');

    if (bucket && accessKeyId && secretAccessKey) {
      this.bucket = bucket;
      this.s3Client = new S3Client({
        region,
        endpoint: endpoint || undefined,
        forcePathStyle:
          (this.configService.get<string>('S3_FORCE_PATH_STYLE') ?? 'false') ===
          'true',
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  async uploadNoticeImage(
    noticeId: number,
    file: Express.Multer.File,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException({
        code: 'NOTICE_IMAGE_REQUIRED',
        message: '업로드할 이미지 파일이 필요합니다.',
      });
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException({
        code: 'INVALID_NOTICE_IMAGE_TYPE',
        message: '이미지 파일만 업로드할 수 있습니다.',
      });
    }
    if (!this.s3Client || !this.bucket) {
      throw new BadRequestException({
        code: 'S3_CONFIG_MISSING',
        message:
          'S3 설정이 없습니다. S3_BUCKET/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY를 설정해주세요.',
      });
    }

    const ext = this.fileExtensionFromMimetype(file.mimetype);
    const key = `notices/${noticeId}/${Date.now()}-${randomUUID()}.${ext}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch {
      throw new InternalServerErrorException({
        code: 'NOTICE_IMAGE_UPLOAD_FAILED',
        message: '공지 이미지 업로드에 실패했습니다.',
      });
    }

    return {
      key,
      url: this.objectUrl(key),
    };
  }

  private fileExtensionFromMimetype(mimetype: string): string {
    const ext = mimetype.split('/')[1];
    if (!ext) return 'bin';
    if (ext.includes('+')) return ext.split('+')[0];
    return ext;
  }

  private objectUrl(key: string): string {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }

    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    if (endpoint) {
      return `${endpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
    }

    const region = this.configService.get<string>('S3_REGION') ?? 'ap-northeast-2';
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}
