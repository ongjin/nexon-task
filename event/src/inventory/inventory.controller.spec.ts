import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
    let controller: InventoryController;
    let service: { addItem: jest.Mock; findByUser: jest.Mock };

    beforeEach(async () => {
        // 컨트롤러 테스트를 위한 모킹된 서비스 메서드 준비
        service = {
            addItem: jest.fn(),
            findByUser: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [InventoryController],
            providers: [{ provide: InventoryService, useValue: service }],
        }).compile();

        controller = module.get<InventoryController>(InventoryController);
    });

    it('컨트롤러가 정의되어 있어야 한다', () => {
        // 컨트롤러 인스턴스가 정상 생성되었는지 확인
        expect(controller).toBeDefined();
    });

    describe('addItem (create)', () => {
        it('DTO와 관리자 ID를 결합해 service.addItem이 호출되어야 한다', () => {
            // 요청 DTO와 req.user.userId 결합 후 addItem 호출 검증
            const dto = { userId: 'user1', itemId: 'itemA', quantity: 10, metadata: { note: 'welcome' } } as any;
            const req = { user: { userId: 'adminX' } } as any;
            service.addItem.mockReturnValue('created');

            const result = controller.addItem(dto, req);
            expect(service.addItem).toHaveBeenCalledWith(
                dto.userId,
                dto.itemId,
                dto.quantity,
                dto.metadata,
                'adminX',
            );
            expect(result).toBe('created');
        });
    });

    describe('getMyInventory()', () => {
        it('토큰 기반 userId로 service.findByUser가 호출되어야 한다', () => {
            // req.user.userId 전달 후 findByUser 호출 검증
            const req = { user: { userId: 'user123' } } as any;
            service.findByUser.mockReturnValue(['inv1']);

            const result = controller.getMyInventory(req);
            expect(service.findByUser).toHaveBeenCalledWith('user123');
            expect(result).toEqual(['inv1']);
        });
    });

    describe('getUserInventory()', () => {
        it('경로 매개변수 userId로 service.findByUser가 호출되어야 한다', () => {
            // URL 파라미터 userId 전달 후 findByUser 호출 검증
            service.findByUser.mockReturnValue(['inv2']);
            const result = controller.getUserInventory('targetUser');
            expect(service.findByUser).toHaveBeenCalledWith('targetUser');
            expect(result).toEqual(['inv2']);
        });
    });
});
