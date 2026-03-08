# gamyeon-backoffice-nest

Nest.js 기반 가면 백오피스 서버 레포지토리.

## 목적
- 관리자 단일 슈퍼계정 로그인 (JWT 인증)
- 대시보드/유저/면접/리포트/질문/공지 관리 API 제공
- 기존 Spring 서비스 DB read-only 조회 기반 모니터링 (예정)

## 현재 상태
- NestJS 11 + TypeScript 기반 API 서버 구현 완료
- 7개 모듈, 24개 API 엔드포인트 구현
- JWT 인증 + 글로벌 가드 적용
- 인메모리 Mock 데이터 사용 (DB 연동 예정)
- ConfigModule.forRoot()로 .env 환경변수 로딩
- 사용자 passwordHash 응답 노출 방지 적용
