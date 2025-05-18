import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
    let service: InventoryService;
    let model: any;
    let saveMock: jest.Mock;

    beforeEach(async () => {
        // save 메서드를 모킹하여 인스턴스 저장 동작을 제어
        saveMock = jest.fn();
        // Inventory 모델을 생성자 함수와 find 메서드를 가진 Jest Mock으로 모킹
        model = jest.fn().mockImplementation(dto => ({ save: saveMock }));
        model.find = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryService,
                { provide: 'InventoryModel', useValue: model },
            ],
        }).compile();

        service = module.get<InventoryService>(InventoryService);
    });

    it('서비스가 정의되어 있어야 한다', () => {
        // InventoryService 인스턴스가 정상 생성되었는지 확인
        expect(service).toBeDefined();
    });

    describe('addItem()', () => {
        const userId = '507f191e810c19729de860ea';
        const itemId = 'item123';
        const quantity = 5;
        const metadata = { reason: 'test' };
        const adminId = '507f191e810c19729de860eb';

        it('유효하지 않은 userId이면 예외를 던진다', async () => {
            // ObjectId 유효성 검사 실패 시 NotFoundException 발생 검사
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(false);
            await expect(service.addItem(userId, itemId, quantity, metadata, adminId))
                .rejects.toBeInstanceOf(NotFoundException);
            expect(model).not.toHaveBeenCalled();
        });

        it('새 인벤토리 항목을 생성해 저장해야 한다', async () => {
            // ObjectId 유효성 검사 통과 및 save 호출 흐름 검사
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            const savedResult = { id: 'inv1', userId, itemId, quantity, metadata, createdBy: adminId };
            saveMock.mockResolvedValue(savedResult);

            await expect(
                service.addItem(userId, itemId, quantity, metadata, adminId),
            ).resolves.toEqual(savedResult);

            // 생성자에 전달된 DTO 필드 검증: ObjectId 변환, 메타데이터, createdBy/updatedBy, grantedAt 포함
            expect(model).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: expect.any(Types.ObjectId),
                    itemId,
                    quantity,
                    metadata,
                    createdBy: adminId,
                    updatedBy: adminId,
                    grantedAt: expect.any(Date),
                }),
            );
            expect(saveMock).toHaveBeenCalled();
        });
    });

    describe('findByUser()', () => {
        const userId = '507f191e810c19729de860ea';

        it('유효하지 않은 userId이면 예외를 던진다', async () => {
            // ObjectId 유효성 검사 실패 시 예외 발생 검증
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(false);
            await expect(service.findByUser(userId)).rejects.toBeInstanceOf(NotFoundException);
            expect(model.find).not.toHaveBeenCalled();
        });

        it('주어진 userId로 find를 호출해 배열을 반환해야 한다', async () => {
            // ObjectId 유효성 검사 통과 및 find 호출 검증
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            const list = [{}, {}];
            model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(list) });

            await expect(service.findByUser(userId)).resolves.toEqual(list);
            expect(model.find).toHaveBeenCalledWith({ userId: expect.any(Types.ObjectId) });
        });
    });
});
