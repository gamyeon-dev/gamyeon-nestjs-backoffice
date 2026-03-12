import 'dotenv/config';
import * as path from 'path';
import { DataSource } from 'typeorm';

const sslEnabled = (process.env.DB_SSL ?? 'false') === 'true';
const sslRejectUnauthorized =
  (process.env.DB_SSL_REJECT_UNAUTHORIZED ?? 'true') === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'gamyeon_backoffice',
  entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: (process.env.DB_SYNCHRONIZE ?? 'false') === 'true',
  logging: (process.env.DB_LOGGING ?? 'false') === 'true',
  ssl: sslEnabled ? { rejectUnauthorized: sslRejectUnauthorized } : undefined,
});

export default AppDataSource;
