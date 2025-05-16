# Auth Service README

이 문서는 **Auth Service**의 설치, 설정, 실행 방법 및 API 명세를 정리한 가이드입니다.

---

## 프로젝트 소개

- **서비스 역할**: 사용자 등록·로그인, JWT 발급·검증, 역할(Role) 기반 인가 수행
- **기술 스택**: NestJS, TypeScript, MongoDB, Mongoose, Passport.js (JWT), class-validator
- **구조**:

  - `UsersModule` (사용자 관리)
  - `AuthModule` (인증/인가)
  - `common` (전역 필터, 인터셉터)

---

## 빠른 시작

### 1. 클론 및 설치

```bash
git clone https://github.com/ongjin/nexon-task.git
cd auth
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고, 다음 값을 설정하세요:

```env
MONGODB_URI=mongodb://localhost:27017/auth
JWT_SECRET=857A9E6A28D951AA72F5368AB468FB8F29AA27F1A2387479D26C2BB708587029
JWT_EXPIRES_IN=3600s
```

### 3. 실행

```bash
npm run start:dev
# 또는
npm run start
```

- 기본 포트: `3001`

---

## 환경 변수

| 이름             | 설명                        | 예시                                                               |
| ---------------- | --------------------------- | ------------------------------------------------------------------ |
| `MONGODB_URI`    | MongoDB 연결 문자열         | `mongodb://localhost:27017/auth`                                   |
| `JWT_SECRET`     | JWT 서명 비밀 키            | `857A9E6A28D951AA72F5368AB468FB8F29AA27F1A2387479D26C2BB708587029` |
| `JWT_EXPIRES_IN` | JWT 만료 시간 (Nest config) | `3600s`, `1h`, `7d`                                                |

---

## API 명세

### 공통 응답 포맷

모든 응답은 다음 구조를 따릅니다:

```json
{
  "code": 200,
  "message": "SUCCESS",
  "data": { ... },
  "timestamp": "2025-05-14T07:00:00.000Z",
  "path": "/auth/..."
}
```

### 1. 회원가입 (Register)

- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Auth**: Public
- **Body**:

  ```json
  { "email": "user@example.com", "password": "password123" }
  ```

- **Response**:

  ```json
  { "data": { "access_token": "<JWT>" } }
  ```

### 2. 로그인 (Login)

- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Auth**: Public
- **Body**:

  ```json
  { "email": "user@example.com", "password": "password123" }
  ```

- **Response**:

  ```json
  { "data": { "access_token": "<JWT>" } }
  ```

### 3. 프로필 조회 (Get Profile)

- **Method**: `GET`
- **Endpoint**: `/auth/profile`
- **Auth**: Bearer JWT
- **Headers**:

  ```
  Authorization: Bearer <token>
  ```

- **Response**:

  ```json
  { "data": { "userId": "...", "roles": ["USER"] } }
  ```

### 4. 전체 사용자 조회 (Get All Users)

- **Method**: `GET`
- **Endpoint**: `/auth/users`
- **Auth**: Bearer JWT + `ADMIN` 권한
- **Response**:

  ```json
  { "data": [ { "id": "...", "email": "...", "roles": ["..."], ... } ] }
  ```

### 5. 역할 변경 (Change User Roles)

- **Method**: `PATCH`
- **Endpoint**: `/auth/users/:id/roles`
- **Auth**: Bearer JWT + `ADMIN`
- **Body**:

  ```json
  { "roles": ["USER", "ADMIN"] }
  ```

- **Response**:

  ```json
  { "data": { "id": "...", "roles": ["USER","ADMIN"], ... } }
  ```

---

## 추가 설정

- **ValidationPipe 옵션**:

  ```ts
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  ```

- **예외 필터 / 인터셉터**는 `AppModule`의 `providers`에 등록되어 있습니다.

---

## 테스트

- **Unit Test**: Jest + Supertest (옵션)
- 테스트 실행:

  ```bash
  npm run test
  ```

---

## 구조

```
src/
├─ auth/
│  ├ dto/          # Register/Login/ChangeRoles DTOs
│  ├ auth.controller.ts
│  ├ auth.service.ts
│  ├ jwt.strategy.ts
│  ├ roles.guard.ts
│  └ roles.decorator.ts
├─ users/
│  ├ schemas/      # Mongoose schema
│  ├ users.service.ts
│  └ users.module.ts
├─ common/
│  ├ filters/
│  └ interceptors/
└─ main.ts
```

---
