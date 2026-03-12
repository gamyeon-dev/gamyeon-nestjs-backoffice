import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const sslEnabled =
          (config.get<string>('DB_SSL', 'false') ?? 'false') === 'true';
        const sslRejectUnauthorized =
          (config.get<string>('DB_SSL_REJECT_UNAUTHORIZED', 'true') ?? 'true') ===
          'true';

        return {
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'gamyeon_backoffice'),
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        logging: config.get<string>('DB_LOGGING', 'false') === 'true',
        migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
        migrationsRun:
          config.get<string>('DB_MIGRATIONS_RUN', 'false') === 'true',
        ssl: sslEnabled ? { rejectUnauthorized: sslRejectUnauthorized } : undefined,
      };
      },
    }),
  ],
})
export class DatabaseModule {}
