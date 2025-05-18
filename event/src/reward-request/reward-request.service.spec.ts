import { Test, TestingModule } from '@nestjs/testing';
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    RewardRequest,
    RewardRequestStatus,
} from './schemas/reward-request.schema';
import { RewardRequestService } from './reward-request.service';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';
import { UpdateRewardRequestStatusDto } from './dto/update-reward-request-status.dto';
import { RewardService } from '../reward/reward.service';
import { InventoryService } from '../inventory/inventory.service';

type MockModel = Partial<
    Record<'findOne' | 'find' | 'findById' | 'findByIdAndUpdate', jest.Mock>
> & { new(dto: any): { save: jest.Mock } };

describe('RewardRequestService', () => {
    let service: RewardRequestService;
    let model: MockModel & jest.Mock;
    let saveMock: jest.Mock;
    let rewardService: { findByEvent: jest.Mock };
    let inventoryService: { addItem: jest.Mock };

    beforeEach(async () => {
        // Mongoose 모델 생성자와 메서드를 모킹하여 서비스 의존성 주입
        saveMock = jest.fn();
        model = jest.fn().mockImplementation((dto) => ({ save: saveMock })) as any;
        model.findOne = jest.fn();
        model.find = jest.fn();
        model.findById = jest.fn();
        model.findByIdAndUpdate = jest.fn();

        // RewardService, InventoryService 메서드 모킹
        rewardService = { findByEvent: jest.fn() };
        inventoryService = { addItem: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RewardRequestService,
                { provide: getModelToken(RewardRequest.name), useValue: model },
                { provide: RewardService, useValue: rewardService },
                { provide: InventoryService, useValue: inventoryService },
            ],
        }).compile();

        service = module.get<RewardRequestService>(RewardRequestService);
    });

    it('서비스가 정의되어 있어야 한다', () => {
        // 서비스 인스턴스가 올바르게 생성되었는지 확인
        expect(service).toBeDefined();
    });

    describe('create()', () => {
        const dto: CreateRewardRequestDto = {
            eventId: '507f1f77bcf86cd799439011',
            details: { foo: 'bar' },
        };
        const userId = '507f1f77bcf86cd799439012';

        it('잘못된 eventId면 예외를 던진다', async () => {
            // ObjectId 유효성 검사 실패 시 BadRequestException 발생 확인
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(false);
            await expect(service.create(userId, dto)).rejects.toBeInstanceOf(BadRequestException);
            expect(model.findOne).not.toHaveBeenCalled();
        });

        it('이미 요청된 경우 ConflictException을 던진다', async () => {
            // 동일 요청 중복 시 예외 처리 검증
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            model.findOne!.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });
            await expect(service.create(userId, dto)).rejects.toBeInstanceOf(ConflictException);
            expect(model.findOne).toHaveBeenCalledWith({
                userId: new Types.ObjectId(userId),
                eventId: new Types.ObjectId(dto.eventId),
            });
        });

        it('새 요청을 생성하고 저장 후 반환해야 한다', async () => {
            // 정상 생성 흐름 확인
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            model.findOne!.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            const saved = { id: 'r1', ...dto, status: RewardRequestStatus.PENDING };
            saveMock.mockResolvedValue(saved);

            const result = await service.create(userId, dto);
            expect(model).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: new Types.ObjectId(userId),
                    eventId: new Types.ObjectId(dto.eventId),
                    details: dto.details,
                    status: RewardRequestStatus.PENDING,
                }),
            );
            expect(saveMock).toHaveBeenCalled();
            expect(result).toEqual(saved);
        });
    });

    describe('findByUser()', () => {
        it('userId로 요청 배열을 반환해야 한다', async () => {
            // find().exec() 호출 및 결과 확인
            const list = [{}, {}];
            (model.find as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(list) });
            const res = await service.findByUser('507f1f77bcf86cd799439012');
            expect(model.find).toHaveBeenCalledWith({ userId: new Types.ObjectId('507f1f77bcf86cd799439012') });
            expect(res).toEqual(list);
        });
    });

    describe('findAll()', () => {
        it('모든 요청을 반환해야 한다', async () => {
            // 전체 조회 검증
            const list = [{}, {}];
            (model.find as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(list) });
            const res = await service.findAll();
            expect(model.find).toHaveBeenCalledWith();
            expect(res).toEqual(list);
        });
    });

    describe('updateStatus()', () => {
        const id = '507f1f77bcf86cd799439013';
        const adminId = '507f1f77bcf86cd799439014';
        const dtoSuccess: UpdateRewardRequestStatusDto = { status: RewardRequestStatus.SUCCESS };
        const dtoFail: UpdateRewardRequestStatusDto = { status: RewardRequestStatus.FAIL };

        it('잘못된 id면 NotFoundException을 던진다', async () => {
            // ID 유효성 실패 시 예외 처리
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(false);
            await expect(service.updateStatus(id, dtoSuccess, adminId)).rejects.toBeInstanceOf(NotFoundException);
        });

        it('존재하지 않는 요청이면 NotFoundException을 던진다', async () => {
            // findById 결과 null 시 예외 처리
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            model.findById!.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.updateStatus(id, dtoSuccess, adminId)).rejects.toBeInstanceOf(NotFoundException);
        });

        it('실패 상태로 업데이트하면 inventory 분배 없이 반환해야 한다', async () => {
            // FAIL 상태 업데이트 시 rewardService, inventoryService 호출 없음 확인
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            const prev = { _id: id, status: RewardRequestStatus.PENDING, eventId: new Types.ObjectId('507f1f77bcf86cd799439015'), userId: new Types.ObjectId('507f1f77bcf86cd799439016') };
            model.findById!.mockReturnValue({ exec: jest.fn().mockResolvedValue(prev) });
            const updated = { ...prev, status: RewardRequestStatus.FAIL };
            model.findByIdAndUpdate!.mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

            const res = await service.updateStatus(id, dtoFail, adminId);
            expect(model.findByIdAndUpdate).toHaveBeenCalledWith(id, { status: dtoFail.status }, { new: true });
            expect(rewardService.findByEvent).not.toHaveBeenCalled();
            expect(inventoryService.addItem).not.toHaveBeenCalled();
            expect(res).toEqual(updated);
        });

        it('성공 상태로 업데이트하면 inventory 분배 후 반환해야 한다', async () => {
            // SUCCESS 상태 업데이트 시 rewardService, inventoryService 호출 검증
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            const prev = { _id: id, status: RewardRequestStatus.PENDING, eventId: new Types.ObjectId('507f1f77bcf86cd799439017'), userId: new Types.ObjectId('507f1f77bcf86cd799439018') };
            model.findById!.mockReturnValue({ exec: jest.fn().mockResolvedValue(prev) });
            const updated = { ...prev, status: RewardRequestStatus.SUCCESS };
            model.findByIdAndUpdate!.mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

            const rewards = [
                { metadata: { itemId: 'itm1' }, type: RewardRequestStatus.SUCCESS, quantity: 2 },
                { metadata: {}, type: 'POINT', quantity: 5 },
            ];
            rewardService.findByEvent.mockResolvedValue(rewards);

            const res = await service.updateStatus(id, dtoSuccess, adminId);
            expect(rewardService.findByEvent).toHaveBeenCalledWith(prev.eventId.toString());
            expect(inventoryService.addItem).toHaveBeenCalledTimes(2);
            expect(inventoryService.addItem).toHaveBeenCalledWith(prev.userId.toString(), 'itm1', 2, rewards[0].metadata, adminId);
            expect(inventoryService.addItem).toHaveBeenCalledWith(prev.userId.toString(), 'POINT', 5, rewards[1].metadata, adminId);
            expect(res).toEqual(updated);
        });
    });
});