import { Test, TestingModule } from '@nestjs/testing';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { RewardType } from './schemas/reward.schema';

describe('RewardController', () => {
    let controller: RewardController;
    let service: Record<'create' | 'findByEvent' | 'findOne' | 'update' | 'remove', jest.Mock>;

    beforeEach(async () => {
        // 컨트롤러 테스트용 모킹된 서비스 메서드 생성
        service = {
            create: jest.fn(),
            findByEvent: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [RewardController],
            providers: [{ provide: RewardService, useValue: service }],
        }).compile();

        controller = module.get<RewardController>(RewardController);
    });

    it('컨트롤러가 정의되어 있어야 한다', () => {
        // RewardController 인스턴스 생성 확인
        expect(controller).toBeDefined();
    });

    describe('create()', () => {
        it('DTO와 사용자 ID를 결합해 service.create 호출해야 한다', () => {
            // 요청 DTO와 req.user.userId 결합 후 create 호출 검증
            const dto = { type: RewardType.ITEM, quantity: 2, metadata: { itemId: 'itm9' } } as any;
            const req = { user: { userId: 'adminX' } } as any;
            service.create.mockReturnValue('created');

            const res = controller.create('evt1', dto, req);
            expect(service.create).toHaveBeenCalledWith('evt1', {
                ...dto,
                createdBy: 'adminX',
                updatedBy: 'adminX',
            });
            expect(res).toBe('created');
        });
    });

    describe('findByEvent()', () => {
        it('eventId로 service.findByEvent 호출해야 한다', () => {
            // 이벤트별 리워드 조회 호출 검증
            service.findByEvent.mockReturnValue(['r1']);
            const res = controller.findByEvent('evt1');
            expect(service.findByEvent).toHaveBeenCalledWith('evt1');
            expect(res).toEqual(['r1']);
        });
    });

    describe('findOne()', () => {
        it('ID로 service.findOne 호출해야 한다', () => {
            // 단일 리워드 조회 호출 검증
            service.findOne.mockReturnValue('r2');
            const res = controller.findOne('rid1');
            expect(service.findOne).toHaveBeenCalledWith('rid1');
            expect(res).toBe('r2');
        });
    });

    describe('update()', () => {
        it('ID와 DTO, 사용자 ID 결합해 service.update 호출해야 한다', () => {
            // 업데이트 호출 검증
            const dto = { type: RewardType.ITEM, quantity: 4 } as any;
            const req = { user: { userId: 'adminY' } } as any;
            service.update.mockReturnValue('upd');

            const res = controller.update('rid2', dto, req);
            expect(service.update).toHaveBeenCalledWith('rid2', {
                ...dto,
                updatedBy: 'adminY',
            });
            expect(res).toBe('upd');
        });
    });

    describe('remove()', () => {
        it('ID로 service.remove 호출해야 한다', () => {
            // 삭제 호출 검증
            service.remove.mockReturnValue(undefined);
            expect(controller.remove('rid3')).toBeUndefined();
            expect(service.remove).toHaveBeenCalledWith('rid3');
        });
    });
});
