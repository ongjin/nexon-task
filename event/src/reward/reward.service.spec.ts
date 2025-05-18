import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RewardService } from './reward.service';
import { Reward, RewardType } from './schemas/reward.schema';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

type MockModel = Partial<Record<
    | 'findOneAndUpdate'
    | 'find'
    | 'findById'
    | 'findByIdAndUpdate'
    | 'findByIdAndDelete',
    jest.Mock
>>;

describe('RewardService', () => {
    let service: RewardService;
    let model: MockModel;

    beforeEach(async () => {
        // Mongoose 모델 메서드를 모킹하여 서비스 인스턴스 생성
        model = {
            findOneAndUpdate: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RewardService,
                { provide: getModelToken(Reward.name), useValue: model },
            ],
        }).compile();

        service = module.get<RewardService>(RewardService);
    });

    it('서비스가 정의되어 있어야 한다', () => {
        // RewardService 인스턴스 생성 확인
        expect(service).toBeDefined();
    });

    describe('create()', () => {
        const dto: CreateRewardDto = {
            type: RewardType.ITEM,
            quantity: 1,
            metadata: { itemId: 'itm1' },
        };

        it('잘못된 metadata 문자열이면 예외를 던진다', async () => {
            // metadata가 JSON이 아닐 경우 BadRequestException 발생 검증
            const badDto = { ...dto, metadata: "not-json" } as any;
            await expect(service.create('evt1', badDto)).rejects.toBeInstanceOf(BadRequestException);
        });

        it('기존 리워드가 없으면 새로 upsert 후 반환해야 한다', async () => {
            // upsert 동작 시 반환값 검증
            const expected = { id: 'r1', ...dto };
            // findOneAndUpdate().exec() 결과 모킹
            (model.findOneAndUpdate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(expected) });

            const res = await service.create('507f1f77bcf86cd799439024', dto);
            expect(model.findOneAndUpdate).toHaveBeenCalledWith(
                expect.objectContaining({ eventId: expect.any(Types.ObjectId), type: dto.type }),
                expect.any(Object),
                expect.objectContaining({ upsert: true, new: true }),
            );
            expect(res).toEqual(expected);
        });
    });

    describe('findAll()', () => {
        it('모든 리워드를 배열로 반환해야 한다', async () => {
            // find().exec() 호출 및 반환값 확인
            const list = [{}, {}];
            (model.find as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(list) });
            await expect(service.findAll()).resolves.toEqual(list);
            expect(model.find).toHaveBeenCalledWith();
        });
    });

    describe('findByEvent()', () => {
        it('잘못된 eventId면 예외를 던진다', async () => {
            // ObjectId 유효성 검사 실패 시 NotFoundException 발생
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(false);
            await expect(service.findByEvent('badId')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('유효한 eventId면 리워드를 반환해야 한다', async () => {
            // 정상 조회 흐름 검증
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            const list = [{}, {}];
            (model.find as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(list) });
            const res = await service.findByEvent('507f1f77bcf86cd799439025');
            expect(model.find).toHaveBeenCalledWith({ eventId: expect.any(Types.ObjectId) });
            expect(res).toEqual(list);
        });
    });

    describe('findOne()', () => {
        it('잘못된 id면 예외를 던진다', async () => {
            // ObjectId 유효성 검사 실패 시 예외 발생
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(false);
            await expect(service.findOne('bad')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('존재하지 않는 보상이면 예외를 던진다', async () => {
            // findById 결과가 null인 경우
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            (model.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.findOne('507f1f77bcf86cd799439026')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('보상이 존재하면 반환해야 한다', async () => {
            // 정상 조회 흐름 검증
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            const reward = { id: 'r2' };
            (model.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(reward) });
            await expect(service.findOne('507f1f77bcf86cd799439026')).resolves.toEqual(reward);
            expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439026');
        });
    });

    describe('update()', () => {
        it('잘못된 id면 예외를 던진다', async () => {
            // ObjectId 유효성 검사 실패 시 예외 발생
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(false);
            await expect(service.update('bad', {} as any)).rejects.toBeInstanceOf(NotFoundException);
        });

        it('업데이트 결과가 null이면 예외를 던진다', async () => {
            // findByIdAndUpdate 결과가 null인 경우
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            (model.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.update('507f1f77bcf86cd799439027', {} as any)).rejects.toBeInstanceOf(NotFoundException);
        });

        it('정상 업데이트 후 보상을 반환해야 한다', async () => {
            // 정상 업데이트 흐름 검증
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            const dto: UpdateRewardDto = { type: RewardType.ITEM, quantity: 5, metadata: { itemId: 'itm5' } };
            const updated = { id: 'r3' };
            (model.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

            const res = await service.update('507f1f77bcf86cd799439027', dto);
            expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439027',
                expect.objectContaining(dto),
                { new: true },
            );
            expect(res).toEqual(updated);
        });
    });

    describe('remove()', () => {
        it('잘못된 id면 예외를 던진다', async () => {
            // ObjectId 유효성 검사 실패 시 예외 발생
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(false);
            await expect(service.remove('bad')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('삭제할 보상이 없으면 예외를 던진다', async () => {
            // findByIdAndDelete 결과가 null인 경우
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            (model.findByIdAndDelete as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.remove('507f1f77bcf86cd799439028')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('정상 삭제되어야 한다', async () => {
            // 삭제 흐름 검증
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            (model.findByIdAndDelete as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });
            await expect(service.remove('507f1f77bcf86cd799439028')).resolves.toBeUndefined();
            expect(model.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439028');
        });
    });
});