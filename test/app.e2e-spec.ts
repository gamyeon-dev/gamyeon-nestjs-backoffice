import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/v1/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.totalCount).toBe(8);
        expect(res.body.filteredCount).toBe(8);
        expect(res.body.items).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              status: expect.any(String),
              sessionCount: expect.any(Number),
              lastActiveAt: expect.any(String),
              joinedAt: expect.any(String),
            }),
          ]),
        );
      });
  });
});
