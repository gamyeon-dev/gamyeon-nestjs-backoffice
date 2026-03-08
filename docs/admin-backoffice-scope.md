# Backoffice Scope

## Auth
- 단일 SUPER_ADMIN 계정 로그인
- JWT 기반 인증 (Bearer token)
- ConfigService 기반 환경변수 주입 (JwtModule.registerAsync)
- `@Public()` 데코레이터로 비인증 라우트 지정

## Dashboard
- KPI 카드 (총 유저, 활성 질문, 활성 공지, 중단 면접, 분석 중 리포트)
- 가입 추이 (최근 N일)
- 면접 완료율, 리포트 분석율
- 최근 활동 로그

## Users (사용자 관리)
- 사용자 목록 조회 (검색, 상태 필터, 정렬, 페이지네이션)
- 사용자 상세 조회 (제재 이력 포함)
- 상태 변경 (ACTIVE / WARNING / SUSPENDED)
  - 상태 전환 규칙 검증 (정지→경고 직접 불가)
- 제재 이력 조회
- passwordHash 응답 제외 (보안)

## Questions (질문 관리)
- CRUD (생성/조회/수정/삭제)
- 최소 10자 유효성 검증
- 소프트 딜리트 (DELETED 상태)
- 날짜 범위 필터

## Notices (공지 관리)
- CRUD (생성/조회/수정/삭제)
- 타입: SERVICE / MAINTENANCE / UPDATE / ETC
- 소프트 딜리트

## Interviews (면접 세션)
- 면접 목록 조회 (중단 건수 포함)
- 면접 상세 조회 (질문별 답변 시간 포함)
- 상태: IN_PROGRESS / COMPLETED / INTERRUPTED / ERROR

## Reports (분석 리포트)
- 리포트 목록 조회
- 리포트 상세 조회 (피드백, 질문별 점수/평가 포함)
- 상태: COMPLETED / IN_PROGRESS / FAILED

## 공통
- 표준 응답 포맷 `{ success, data }` / `{ success, error }`
- 한글 에러 메시지
- 글로벌 JWT 가드 + HttpExceptionFilter + ResponseInterceptor
- 인메모리 Mock 데이터 (DB 연동 예정)
