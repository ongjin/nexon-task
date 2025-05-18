import { Test, TestingModule } from '@nestjs/testing';
import { RewardRequestController } from './reward-request.controller';
import { RewardRequestService } from './reward-request.service';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';
import { UpdateRewardRequestStatusDto } from './dto/update-reward-request-status.dto';
import { RewardRequestStatus } from './schemas/reward-request.schema';

describe('RewardRequestController', () => {
    let controller: RewardRequestController;
    let service: Record<'create' | 'findByUser' | 'findAll' | 'updateStatus', jest.Mock>;

    beforeEach(async () => {
        // 컨트롤러 테스트용 모킹된 서비스 메서드 생성
        service = {
            create: jest.fn(),
            findByUser: jest.fn(),
            findAll: jest.fn(),
            updateStatus: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [RewardRequestController],
            providers: [{ provide: RewardRequestService, useValue: service }],
        }).compile();

        controller = module.get<RewardRequestController>(RewardRequestController);
    });

    it('컨트롤러가 정의되어 있어야 한다', () => {
        // 컨트롤러 인스턴스 생성 확인
        expect(controller).toBeDefined();
    });

    describe('create()', () => {
        it('사용자 ID와 DTO를 결합해 service.create 호출해야 한다', () => {
            // 요청 DTO와 req.user.userId 결합 후 create 호출 검증
            const dto: CreateRewardRequestDto = { eventId: 'evt1', details: {} };
            const req = { user: { userId: 'usr1' } } as any;
            service.create.mockReturnValue('ok');

            const res = controller.create(req, dto);
            expect(service.create).toHaveBeenCalledWith('usr1', dto);
            expect(res).toBe('ok');
        });
    });

    describe('findByUser()', () => {
        it('토큰 기반 userId로 service.findByUser 호출해야 한다', () => {
            // req.user.userId 전달 후 findByUser 호출 검증
            const req = { user: { userId: 'usr2' } } as any;
            service.findByUser.mockReturnValue(['a']);
            const res = controller.findByUser(req);
            expect(service.findByUser).toHaveBeenCalledWith('usr2');
            expect(res).toEqual(['a']);
        });
    });

    describe('findAll()', () => {
        it('service.findAll 호출해야 한다', () => {
            // 전체 조회 호출 검증
            service.findAll.mockReturnValue(['all']);
            const res = controller.findAll();
            expect(service.findAll).toHaveBeenCalled();
            expect(res).toEqual(['all']);
        });
    });

    describe('updateStatus()', () => {
        it('ID, DTO, 사용자 ID를 이용해 service.updateStatus 호출해야 한다', () => {
            // 업데이트 호출 검증
            const id = 'rid1';
            const dto: UpdateRewardRequestStatusDto = { status: RewardRequestStatus.SUCCESS };
            const req = { user: { userId: 'admin1' } } as any;
            service.updateStatus.mockReturnValue('done');

            const res = controller.updateStatus(id, dto, req);
            expect(service.updateStatus).toHaveBeenCalledWith(id, dto, 'admin1');
            expect(res).toBe('done');
        });
    });
});
