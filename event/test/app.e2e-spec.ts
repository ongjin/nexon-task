import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext, CanActivate } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RolesGuard } from '../src/auth/roles.guard';

// 고유값 생성을 위한 헬퍼 함수
function generateRandom(): string {
    return Math.random().toString(36).substr(2, 6);
}

/**
 * App E2E Tests
 * 이 테스트 스위트는 다음 모듈의 주요 엔드포인트를 검증합니다:
 * 1. EventModule
 * 2. RewardModule
 * 3. RewardRequestModule
 * 4. InventoryModule
 */
describe('App E2E Tests', () => {
    let app: INestApplication;

    // 모든 요청을 ADMIN 권한으로 처리하는 가드 모킹 클래스
    class JwtAuthGuardMock implements CanActivate {
        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req = context.switchToHttp().getRequest();
            req.user = {
                userId: '68280ce98fbeab8686314957',
                email: 'admin@nexon.com',
                roles: ['ADMIN'],
            };
            return true;
        }
    }

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(AuthGuard('jwt'))
            .useClass(JwtAuthGuardMock)
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
        );
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    let eventId: string;
    let rewardId: string;
    let rewardRequestId: string;
    const inventoryUserId = '68280ce98fbeab8686314957';

    /**
     * 1. EventModule 테스트
     */
    describe('EventModule (이벤트 관리)', () => {
        it('POST /events - 이벤트 생성', async () => {
            const random = generateRandom();
            const createDto = {
                name: '테스트 이벤트_' + random,
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 3600000).toISOString(),
                condition: { type: 'cond', value: 1 },
            };
            const res = await request(app.getHttpServer())
                .post('/events')
                .send(createDto)
                .expect(201);
            expect(res.body.data._id).toBeDefined();
            expect(res.body.data.name).toEqual(createDto.name);
            expect(res.body.data.status).toEqual(createDto.status);
            eventId = res.body.data._id;
        });

        it('GET /events - 이벤트 목록 조회', async () => {
            const res = await request(app.getHttpServer())
                .get('/events')
                .expect(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('GET /events/:id - 이벤트 상세 조회', async () => {
            const res = await request(app.getHttpServer())
                .get(`/events/${eventId}`)
                .expect(200);
            expect(res.body.data._id).toEqual(eventId);
        });

        it('PATCH /events/:id - 이벤트 수정', async () => {
            const updateDto = { name: '수정된 테스트 이벤트_' + generateRandom() };
            const res = await request(app.getHttpServer())
                .patch(`/events/${eventId}`)
                .send(updateDto)
                .expect(200);
            expect(res.body.data.name).toEqual(updateDto.name);
        });

        it('DELETE /events/:id - 이벤트 삭제', async () => {
            await request(app.getHttpServer())
                .delete(`/events/${eventId}`)
                .expect(200);
        });
    });

    /**
     * 2. RewardModule 테스트
     */
    describe('RewardModule (보상 관리)', () => {
        beforeAll(async () => {
            const random = generateRandom();
            const dto = {
                name: '보상 이벤트_' + random,
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 3600000).toISOString(),
                condition: { type: 'cond', value: 1 },
            };
            const res = await request(app.getHttpServer())
                .post('/events')
                .send(dto)
                .expect(201);
            eventId = res.body.data._id;
        });

        it('POST /events/:eventId/rewards - 보상 등록', async () => {
            const rewardDto = { type: 'ITEM', quantity: 1, metadata: { itemId: 'itm1' } };
            const res = await request(app.getHttpServer())
                .post(`/events/${eventId}/rewards`)
                .send(rewardDto)
                .expect(201);
            expect(res.body.data._id).toBeDefined();
            expect(res.body.data.type).toEqual(rewardDto.type);
            expect(res.body.data.quantity).toEqual(rewardDto.quantity);
            rewardId = res.body.data._id;
        });

        it('GET /events/:eventId/rewards - 보상 목록 조회', async () => {
            const res = await request(app.getHttpServer())
                .get(`/events/${eventId}/rewards`)
                .expect(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.some(r => r._id === rewardId)).toBe(true);
        });

        it('GET /events/:eventId/rewards/:id - 보상 상세 조회', async () => {
            const res = await request(app.getHttpServer())
                .get(`/events/${eventId}/rewards/${rewardId}`)
                .expect(200);
            expect(res.body.data._id).toEqual(rewardId);
        });

        it('PATCH /events/:eventId/rewards/:id - 보상 수정', async () => {
            const updateDto = { type: 'ITEM', quantity: 2, metadata: { itemId: 'itm2' } };
            const res = await request(app.getHttpServer())
                .patch(`/events/${eventId}/rewards/${rewardId}`)
                .send(updateDto)
                .expect(200);
            expect(res.body.data.quantity).toEqual(updateDto.quantity);
        });

        it('DELETE /events/:eventId/rewards/:id - 보상 삭제', async () => {
            await request(app.getHttpServer())
                .delete(`/events/${eventId}/rewards/${rewardId}`)
                .expect(200);
        });

        it('POST /events/:eventId/rewards - 보상 등록', async () => {
            const rewardDto = { type: 'ITEM', quantity: 1, metadata: { itemId: 'itm1' } };
            const res = await request(app.getHttpServer())
                .post(`/events/${eventId}/rewards`)
                .send(rewardDto)
                .expect(201);
            expect(res.body.data._id).toBeDefined();
            expect(res.body.data.type).toEqual(rewardDto.type);
            expect(res.body.data.quantity).toEqual(rewardDto.quantity);
            rewardId = res.body.data._id;
        });
    });

    /**
     * 3. RewardRequestModule 테스트
     */
    describe('RewardRequestModule (보상 요청)', () => {
        it('POST /reward-requests - 보상 요청 생성', async () => {
            const reqDto = { eventId, details: { consecutiveLogins: 5, quantity: 2 } };
            const res = await request(app.getHttpServer())
                .post('/reward-requests')
                .send(reqDto)
                .expect(201);
            expect(res.body.data._id).toBeDefined();
            rewardRequestId = res.body.data._id;
        });

        it('GET /reward-requests - 본인 요청 내역 조회', async () => {
            const res = await request(app.getHttpServer())
                .get('/reward-requests')
                .expect(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.some(r => r._id === rewardRequestId)).toBe(true);
        });

        it('GET /admin/reward-requests - 전체 요청 내역 조회', async () => {
            const res = await request(app.getHttpServer())
                .get('/admin/reward-requests')
                .expect(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('PATCH /reward-requests/:id/status - 요청 상태 변경', async () => {
            const statusDto = { status: 'SUCCESS' };
            const res = await request(app.getHttpServer())
                .patch(`/reward-requests/${rewardRequestId}/status`)
                .send(statusDto)
                .expect(200);
            expect(res.body.data.status).toEqual(statusDto.status);
        });
    });

    /**
     * 4. InventoryModule 테스트
     */
    describe('InventoryModule (인벤토리 관리)', () => {

        it('POST /inventory - 아이템/포인트 수동 적립', async () => {
            const itemDto = { userId: inventoryUserId, itemId: 'itemXYZ_' + generateRandom(), quantity: 10, metadata: {} };
            const res = await request(app.getHttpServer())
                .post('/inventory')
                .send(itemDto)
                .expect(201);
            expect(res.body.data.userId).toEqual(inventoryUserId);
        });

        it('GET /inventory - 본인 인벤토리 조회', async () => {
            const res = await request(app.getHttpServer())
                .get('/inventory')
                .expect(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /inventory/:userId - 특정 유저 인벤토리 조회', async () => {
            const res = await request(app.getHttpServer())
                .get(`/inventory/${inventoryUserId}`)
                .expect(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
