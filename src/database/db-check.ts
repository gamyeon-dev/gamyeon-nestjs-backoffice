import 'dotenv/config';
import { Client } from 'pg';

const sslEnabled = (process.env.DB_SSL ?? 'false') === 'true';
const sslRejectUnauthorized =
  (process.env.DB_SSL_REJECT_UNAUTHORIZED ?? 'true') === 'true';

const client = new Client({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  user: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'gamyeon_backoffice',
  ssl: sslEnabled ? { rejectUnauthorized: sslRejectUnauthorized } : undefined,
});

async function main() {
  try {
    await client.connect();
    const result = await client.query('SELECT NOW() AS now');
    console.log('DB 연결 성공:', result.rows[0]?.now ?? 'OK');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('DB 연결 실패:', error);
    try {
      await client.end();
    } catch {
      // ignore
    }
    process.exit(1);
  }
}

main();
