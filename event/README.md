# Event Service README

이 문서는 **Event**의 설치, 설정, 실행 방법 및 API 명세를 정리한 가이드입니다.

---

## 프로젝트 소개

- **서비스 역할**: 이벤트 관리, 보상(Reward) 등록/조회/수정/삭제, 보상 요청 상태 관리, 인벤토리 연동
- **기술 스택**: NestJS, TypeScript, MongoDB, Mongoose, Passport.js (JWT), class-validator, winston
- **모듈 구성**:

  - `EventModule` - 이벤트 CRUD
  - `RewardModule` - 이벤트 연관 보상 관리
  - `RewardRequestModule` - 사용자 보상 요청 처리
  - `InventoryModule` - 인벤토리(아이템/포인트) 관리
  - `common` - 필터, 인터셉터, 미들웨어

---

## 🚀 빠른 시작

### 1. 클론 및 설치

```bash
git clone https://github.com/ongjin/nexon-task.git
cd event
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고, 다음 값을 설정하세요:

```env
MONGODB_URI=mongodb://localhost:27017/event
JWT_SECRET=yourSecretKey
JWT_EXPIRES_IN=3600s
```

### 3. 실행

```bash
npm run start:dev
# 또는
npm run start
```

- 기본 포트: `3002`

---

## 환경 변수

| 이름             | 설명                | 예시                              |
| ---------------- | ------------------- | --------------------------------- |
| `MONGODB_URI`    | MongoDB 연결 문자열 | `mongodb://localhost:27017/event` |
| `JWT_SECRET`     | JWT 서명 비밀 키    | `yourSecretKey`                   |
| `JWT_EXPIRES_IN` | JWT 만료 시간       | `3600s`, `1h`, `7d`               |

---

## API 명세

모든 엔드포인트는 JWT 인증(`Authorization: Bearer <token>`)과 응답 포맷을 동일하게 사용합니다.

```json
{
  "code": 200,
  "message": "SUCCESS",
  "data": ...,
  "timestamp": "2025-05-14Txx:xx:xx.xxxZ",
  "path": "/..."
}
```

### 1. EventModule (이벤트 관리)

| Method | Endpoint     | 권한                           | 설명             |
| ------ | ------------ | ------------------------------ | ---------------- |
| POST   | /events      | OPERATOR, ADMIN                | 이벤트 생성      |
| GET    | /events      | USER, OPERATOR, AUDITOR, ADMIN | 이벤트 목록 조회 |
| GET    | /events/\:id | USER, OPERATOR, AUDITOR, ADMIN | 이벤트 상세 조회 |
| PATCH  | /events/\:id | OPERATOR, ADMIN                | 이벤트 수정      |
| DELETE | /events/\:id | OPERATOR, ADMIN                | 이벤트 삭제      |

### 2. RewardModule (보상 관리)

| Method | Endpoint                       | 권한                           | 설명           |
| ------ | ------------------------------ | ------------------------------ | -------------- |
| POST   | /events/\:eventId/rewards      | OPERATOR, ADMIN                | 보상 등록      |
| GET    | /events/\:eventId/rewards      | USER, OPERATOR, AUDITOR, ADMIN | 보상 목록 조회 |
| GET    | /events/\:eventId/rewards/\:id | USER, OPERATOR, AUDITOR, ADMIN | 보상 상세 조회 |
| PATCH  | /events/\:eventId/rewards/\:id | OPERATOR, ADMIN                | 보상 수정      |
| DELETE | /events/\:eventId/rewards/\:id | OPERATOR, ADMIN                | 보상 삭제      |

### 3. RewardRequestModule (보상 요청)

| Method | Endpoint                     | 권한                     | 설명                                      |
| ------ | ---------------------------- | ------------------------ | ----------------------------------------- |
| POST   | /reward-requests             | USER                     | 보상 요청                                 |
| GET    | /reward-requests             | USER                     | 본인 요청 내역 조회                       |
| GET    | /admin/reward-requests       | ADMIN, OPERATOR, AUDITOR | 전체 요청 내역 조회                       |
| PATCH  | /reward-requests/\:id/status | OPERATOR, ADMIN          | 요청 상태 변경 (SUCCESS 시 인벤토리 적립) |

### 4. InventoryModule (인벤토리 관리)

| Method | Endpoint            | 권한                           | 설명                    |
| ------ | ------------------- | ------------------------------ | ----------------------- |
| POST   | /inventory          | OPERATOR, ADMIN                | 아이템/포인트 수동 적립 |
| GET    | /inventory          | USER, OPERATOR, AUDITOR, ADMIN | 본인 인벤토리 조회      |
| GET    | /inventory/\:userId | OPERATOR, AUDITOR, ADMIN       | 특정 유저 인벤토리 조회 |

---

## 예외 및 로깅

- **ValidationPipe**: DTO 유효성 검사 (`whitelist`, `forbidNonWhitelisted` 활성화)
- **HttpExceptionFilter**: 상세 에러 메시지 포맷
- **LoggerMiddleware**: winston 기반 요청·응답 로그

---

## 디렉터리 구조

```
src/
├─ auth/                    # JWT 전략, RolesGuard, decorator
├─ event/
│  ├─ schemas/
│  ├─ dto/
│  ├─ event.module.ts
│  ├─ event.service.ts
│  └─ event.controller.ts
├─ reward/
│  ├─ schemas/
│  ├─ dto/
│  ├─ reward.module.ts
│  ├─ reward.service.ts
│  └─ reward.controller.ts
├─ reward-request/
│  ├─ schemas/
│  ├─ dto/
│  ├─ reward-request.module.ts
│  ├─ reward-request.service.ts
│  └─ reward-request.controller.ts
├─ inventory/
│  ├─ schemas/
│  ├─ dto/
│  ├─ inventory.module.ts
│  ├─ inventory.service.ts
│  └─ inventory.controller.ts
└─ common/
   ├─ filters/
   ├─ interceptors/
   ├─ middleware/
   └─ utils/
```

---

## 테스트

- **Unit Test**: Jest + Supertest 사용 권장
- **E2E Test**: 전체 플로우(이벤트→보상→요청→적립) 시나리오 검증
- **테스트 실행**:

  ```bash
  npm run test
  npm run test:e2e
  ```

---
