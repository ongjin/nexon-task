/**
 * app.e2e-spec.ts
 *
 * 종합 E2E 테스트 스위트:
 * - 인메모리 MongoDB 서버를 사용해 매번 깨끗한 DB로 초기화
 * - 회원가입, 로그인, 프로필 조회, 권한 검증, 역할 변경, 사용자 목록 조회 흐름을 단계별로 검증
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnect } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/users/schemas/user.schema';

describe('App E2E Tests', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let accessToken: string; // JWT 토큰 저장
    let userId: string; // 생성된 유저 ID 저장

    // 테스트에 사용할 계정 정보 및 역할 상수
    const email = 'e2e@test.com';
    const password = 'pass123';
    const ADMIN_ROLE = 'ADMIN';
    const USER_ROLE = 'USER';
    const OPERATOR_ROLE = 'OPERATOR';
    const AUDITOR_ROLE = 'AUDITOR';

    beforeAll(async () => {
        // 1) 인메모리 MongoDB 서버 시작
        mongod = await MongoMemoryServer.create();

        // 2) Nest 애플리케이션 모듈 초기화
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // 유효성 검사 파이프 등록: DTO의 whitelist 옵션 적용
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    afterAll(async () => {
        // 애플리케이션 종료 및 DB 연결 해제
        await app.close();
        await disconnect();
        await mongod.stop();
    });

    it('/auth/register (POST) - create new user', () => {
        // 회원가입 API 호출 후 토큰 발급 검증
        return request(app.getHttpServer())
            .post('/auth/register')
            .send({ email, password })
            .expect(201)
            .then(({ body }) => {
                // 응답 래퍼(data)에 access_token 프로퍼티 확인
                expect(body.data).toHaveProperty('access_token');
                accessToken = body.data.access_token;
            });
    });

    it('/auth/login (POST) - login existing user', () => {
        // 로그인 API 호출 후 토큰 재발급 검증
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password })
            .expect(201)
            .then(({ body }) => {
                expect(body.data).toHaveProperty('access_token');
                accessToken = body.data.access_token;
            });
    });

    it('/auth/profile (GET) - get own profile', () => {
        // 인증된 사용자 프로필 조회
        return request(app.getHttpServer())
            .get('/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
            .then(({ body }) => {
                // 프로필 응답에 userId, roles 포함 여부 확인
                expect(body.data).toHaveProperty('userId');
                expect(body.data).toHaveProperty('roles');
                userId = body.data.userId;
            });
    });

    it('/auth/users (GET) - forbid normal user', () => {
        // 일반 사용자로 전체 사용자 목록 조회 시 403 Forbidden 확인
        return request(app.getHttpServer())
            .get('/auth/users')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(403);
    });

    // DB업데이트 후 OPERATOR, AUDITOR 전체 사용자 목록 조회 시 403 Forbidden 확인
    // it('roles OPERATOR/AUDITOR should also be forbidden for admin-only endpoints', async () => {
    //     const userModel = app.get(getModelToken(User.name));
    //     // OPERATOR 테스트
    //     await userModel.findByIdAndUpdate(userId, { roles: [OPERATOR_ROLE] });
    //     // 재로그인
    //     let res = await request(app.getHttpServer())
    //         .post('/auth/login')
    //         .send({ email, password });
    //     accessToken = res.body.data.access_token;
    //     await request(app.getHttpServer())
    //         .get('/auth/users')
    //         .set('Authorization', `Bearer ${accessToken}`)
    //         .expect(403);

    //     // AUDITOR 테스트
    //     await userModel.findByIdAndUpdate(userId, { roles: [AUDITOR_ROLE] });
    //     res = await request(app.getHttpServer())
    //         .post('/auth/login')
    //         .send({ email, password });
    //     accessToken = res.body.data.access_token;
    //     await request(app.getHttpServer())
    //         .get('/auth/users')
    //         .set('Authorization', `Bearer ${accessToken}`)
    //         .expect(403);
    // });

    it('PATCH /auth/users/:id/roles as USER → 403', () => {
        // 일반 사용자로 역할 변경 시도 시 403 Forbidden 검증
        return request(app.getHttpServer())
            .patch(`/auth/users/${userId}/roles`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ roles: [ADMIN_ROLE] })
            .expect(403);
    });

    it('Make user admin directly in DB and re-login', async () => {
        // DB 레벨에서 직접 ADMIN 권한 부여
        const userModel = app.get(getModelToken(User.name));
        await userModel.findByIdAndUpdate(userId, { roles: [ADMIN_ROLE] });

        // 재로그인으로 ADMIN 권한 반영된 토큰 획득
        const { body } = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password })
            .expect(201);

        accessToken = body.data.access_token;
    });

    it('PATCH /auth/users/:id/roles as ADMIN → 200', () => {
        // ADMIN 권한으로 역할 변경 후 정상 응답 확인
        return request(app.getHttpServer())
            .patch(`/auth/users/${userId}/roles`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ roles: [USER_ROLE] })
            .expect(200)
            .then(({ body }) => {
                // 변경된 roles 필드에 USER가 포함됐는지 검증
                expect(body.data.roles).toContain(USER_ROLE);
            });
    });

    it('GET /auth/users as ADMIN → 200 & array', () => {
        // ADMIN 권한으로 사용자 목록 조회 시 정상 배열 반환 검증
        return request(app.getHttpServer())
            .get('/auth/users')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
            .then(({ body }) => {
                expect(Array.isArray(body.data)).toBe(true);
            });
    });
});
