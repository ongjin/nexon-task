import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { EventService } from './event.service';
import { Event } from './schemas/event.schema';

type MockModel = jest.Mock & {
    findOne?: jest.Mock;
    find?: jest.Mock;
    findById?: jest.Mock;
    findByIdAndUpdate?: jest.Mock;
    findByIdAndDelete?: jest.Mock;
};

describe('EventService', () => {
    let service: EventService;
    let model: MockModel;
    let saveMock: jest.Mock;

    beforeEach(async () => {
        // Mongoose 모델과 save 메서드를 모킹하여 서비스 초기화
        saveMock = jest.fn();
        model = jest.fn().mockImplementation(dto => ({ save: saveMock })) as any;
        model.findOne = jest.fn();
        model.find = jest.fn();
        model.findById = jest.fn();
        model.findByIdAndUpdate = jest.fn();
        model.findByIdAndDelete = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventService,
                { provide: getModelToken(Event.name), useValue: model },
            ],
        }).compile();

        service = module.get<EventService>(EventService);
    });

    it('서비스가 정의되어 있어야 한다', () => {
        // 서비스 인스턴스가 올바르게 생성되었는지 확인
        expect(service).toBeDefined();
    });

    describe('create()', () => {
        const dto = {
            name: 'TestEvent',
            description: 'desc',
            startDate: '2025-06-01',
            endDate: '2025-06-05',
        } as any;

        it('같은 이름의 이벤트가 이미 존재하면 예외를 던진다 (ConflictException)', async () => {
            // 이름 중복 검사 시 이미 존재하면 예외 처리
            model.findOne!.mockReturnValue({ exec: jest.fn().mockResolvedValue({ name: dto.name }) });
            await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
            expect(model.findOne).toHaveBeenCalledWith({ name: dto.name });
        });

        it('새 이벤트를 생성하고 저장 후 반환해야 한다', async () => {
            // 중복이 없을 때 모델 인스턴스 생성 및 save 호출
            model.findOne!.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            const fakeSaved = { ...dto, createdAt: new Date(), updatedAt: new Date() };
            saveMock.mockResolvedValue(fakeSaved);

            const result = await service.create(dto);

            // 생성자에 올바른 필드가 전달되었는지 확인
            expect(model).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: dto.name,
                    description: dto.description,
                    startDate: expect.any(Date),
                    endDate: expect.any(Date),
                }),
            );
            expect(saveMock).toHaveBeenCalled();
            expect(result).toEqual(fakeSaved);
        });
    });

    describe('findAll()', () => {
        it('모든 이벤트를 배열로 반환해야 한다', async () => {
            // find().exec() 호출 및 반환 값 확인
            const list = [{}, {}];
            model.find!.mockReturnValue({ exec: jest.fn().mockResolvedValue(list) });
            await expect(service.findAll()).resolves.toEqual(list);
            expect(model.find).toHaveBeenCalled();
        });
    });

    describe('findOne()', () => {
        const id = '507f191e810c19729de860ea';

        it('유효하지 않은 ID면 예외를 던진다 (NotFoundException)', async () => {
            // ObjectId 유효성 검사 실패 시 예외 발생
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(false);
            await expect(service.findOne(id)).rejects.toBeInstanceOf(NotFoundException);
            expect(model.findById).not.toHaveBeenCalled();
        });

        it('존재하지 않는 이벤트면 예외를 던진다', async () => {
            // 유효한 ID지만 findById 결과가 null인 경우 예외 처리
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            model.findById!.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.findOne(id)).rejects.toBeInstanceOf(NotFoundException);
        });

        it('이벤트가 존재하면 반환해야 한다', async () => {
            // 정상 조회 흐름 검증
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            const found = { id, name: 'E' };
            model.findById!.mockReturnValue({ exec: jest.fn().mockResolvedValue(found) });
            await expect(service.findOne(id)).resolves.toEqual(found);
            expect(model.findById).toHaveBeenCalledWith(id);
        });
    });

    describe('update()', () => {
        const id = '507f191e810c19729de860ea';

        it('업데이트가 실패하면 예외를 던진다', async () => {
            // findByIdAndUpdate 결과가 null인 경우 예외 처리
            model.findByIdAndUpdate!.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.update(id, { name: 'New' } as any)).rejects.toBeInstanceOf(NotFoundException);
            expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
                id,
                expect.objectContaining({ name: 'New' }),
                { new: true },
            );
        });

        it('날짜 필드 없을 때도 정상 업데이트해야 한다', async () => {
            // 단순 필드 업데이트 흐름 확인
            const updated = { id, name: 'NewName' };
            (model.findByIdAndUpdate as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(updated),
            });

            const res = await service.update(id, { name: 'NewName' } as any);
            expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
                id,
                { name: 'NewName' },
                { new: true },
            );
            expect(res).toEqual(updated);
        });

        it('날짜 필드 제공 시 Date 변환 후 업데이트해야 한다', async () => {
            // startDate, endDate 문자열을 Date로 변환해서 업데이트
            const updDto = { startDate: '2025-07-01', endDate: '2025-07-02' } as any;
            const updated = { id, ...updDto };
            (model.findByIdAndUpdate as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(updated),
            });

            await service.update(id, updDto);
            expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
                id,
                {
                    ...(updDto as object),
                    startDate: expect.any(Date),
                    endDate: expect.any(Date),
                },
                { new: true },
            );
        });
    });

    describe('remove()', () => {
        const id = '507f191e810c19729de860ea';

        it('유효하지 않은 ID면 예외를 던진다', async () => {
            // ObjectId 유효성 검사 실패 시 예외 처리
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(false);
            await expect(service.remove(id)).rejects.toBeInstanceOf(NotFoundException);
            expect(model.findByIdAndDelete).not.toHaveBeenCalled();
        });

        it('삭제할 문서가 없으면 예외를 던진다', async () => {
            // findByIdAndDelete 결과가 null일 때 예외 처리
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            model.findByIdAndDelete!.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.remove(id)).rejects.toBeInstanceOf(NotFoundException);
        });

        it('정상적으로 삭제되어야 한다', async () => {
            // 삭제 흐름 검증
            jest.spyOn(Types.ObjectId, 'isValid').mockReturnValue(true);
            model.findByIdAndDelete!.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });
            await expect(service.remove(id)).resolves.toBeUndefined();
            expect(model.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });
});