# Gateway Service README

이 문서는 **API Gateway Service**의 설치, 설정, 실행 방법 및 API 명세를 정리한 가이드입니다. Gateway는 클라이언트 요청을 받아 내부의 Auth Service와 Event Service로 프록시하여 전달합니다.

---

## 프로젝트 소개

- **서비스 역할**: 클라이언트 요청을 받아 Auth Service 및 Event Service로 전달, 응답을 클라이언트에 반환
- **기술 스택**: NestJS, TypeScript, axios, Passport.js (JWT), class-validator, @nestjs/config
- **구조**:

  ```
  src/
  ├─ controllers/
  │  ├ auth.controller.ts    # /auth/* 엔드포인트 프록시
  │  └ event.controller.ts   # /event/* 엔드포인트 프록시
  ├─ proxy/
  │  ├ proxy.module.ts      # ProxyModule 정의
  │  └ proxy.service.ts     # Axios 기반 요청 전달 로직
  ├─ auth/
  │  ├ jwt.strategy.ts      # JWT 전략 설정
  │  ├ jwt-auth.guard.ts    # JwtAuthGuard
  │  ├ roles.decorator.ts   # @Roles() 데코레이터
  │  └ roles.guard.ts       # RolesGuard
  ├─ common/
  │  ├ enums/               # Role enum 등
  │  └ middleware/          # LoggerMiddleware 등
  ├─ app.module.ts          # 모듈 구성
  └─ main.ts                # 애플리케이션 부트스트랩
  ```

---

## 빠른 시작

### 1. 클론 및 설치

```bash
git clone <리포지토리_URL>
cd gateway
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고, 다음 값을 설정하세요:

```env
# Gateway 포트 설정
PORT=3000

# 내부 서비스 URL
AUTH_URL=http://localhost:3001
EVENT_URL=http://localhost:3002

# JWT 설정 (Auth Service와 동일하게)
JWT_SECRET=jwt-secret
JWT_EXPIRES_IN=3600s
```

### 3. 실행

```bash
npm run start:dev   # 개발 모드
npm run start      # 프로덕션 모드
```

- 기본 포트: `3000`

---

## 환경 변수

| 이름             | 설명                         | 예시                    |
| ---------------- | ---------------------------- | ----------------------- |
| `PORT`           | Gateway 실행 포트            | `3000`                  |
| `AUTH_URL`       | Auth Service 엔드포인트 URL  | `http://localhost:3001` |
| `EVENT_URL`      | Event Service 엔드포인트 URL | `http://localhost:3002` |
| `JWT_SECRET`     | JWT 서명 비밀 키             | `jwt-secret`            |
| `JWT_EXPIRES_IN` | JWT 만료 시간                | `3600s`, `1h`, `7d`     |

---

## 인증 및 권한

- **JWT 인증**: `JwtAuthGuard`를 사용하여 토큰 검증
- **역할 기반 권한**: `@Roles()` 데코레이터와 `RolesGuard`로 ADMIN 권한 제어

---

## 전역 설정

- `@nestjs/config`로 `.env` 설정 로드 (isGlobal: true)
- `LoggerMiddleware`가 모든 라우트에 적용
- `ValidationPipe` 글로벌 등록 (whitelist, forbidNonWhitelisted)

---
