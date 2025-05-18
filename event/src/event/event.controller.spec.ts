import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from './schemas/event.schema';

describe('EventController', () => {
    let controller: EventController;
    let service: Record<'create' | 'findAll' | 'findOne' | 'update' | 'remove', jest.Mock>;

    beforeEach(async () => {
        // 컨트롤러와 모킹된 서비스 초기화
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventController],
            providers: [{ provide: EventService, useValue: service }],
        }).compile();

        controller = module.get<EventController>(EventController);
    });

    it('컨트롤러가 정의되어 있어야 한다', () => {
        // 컨트롤러 인스턴스 생성 확인
        expect(controller).toBeDefined();
    });

    describe('create()', () => {
        it('DTO와 사용자 ID를 결합해 서비스.create가 호출되어야 한다', () => {
            // 요청에서 userId를 병합 후 create 호출 검증
            const dto: CreateEventDto = {
                name: 'E1',
                condition: { type: 'cond', value: 1 },
                startDate: '2025-06-01T00:00:00Z',
                endDate: '2025-06-02T00:00:00Z',
                status: EventStatus.ACTIVE,
            };
            const req = { user: { userId: 'userA' } } as any;
            service.create.mockReturnValue('created');

            const res = controller.create(dto, req);
            expect(service.create).toHaveBeenCalledWith({
                ...dto,
                createdBy: 'userA',
                updatedBy: 'userA',
            });
            expect(res).toBe('created');
        });
    });

    describe('findAll()', () => {
        it('서비스.findAll이 호출되어야 한다', () => {
            // 리스트 조회 호출 검증
            service.findAll.mockReturnValue(['a', 'b']);
            expect(controller.findAll()).toEqual(['a', 'b']);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne()', () => {
        it('주어진 ID로 서비스.findOne이 호출되어야 한다', () => {
            // 단일 조회 호출 검증
            service.findOne.mockReturnValue({ id: '123' });
            expect(controller.findOne('123')).toEqual({ id: '123' });
            expect(service.findOne).toHaveBeenCalledWith('123');
        });
    });

    describe('update()', () => {
        it('ID와 DTO, 사용자 ID를 병합해 서비스.update가 호출되어야 한다', () => {
            // 업데이트 호출 검증
            const dto: UpdateEventDto = { name: 'E2' };
            const req = { user: { userId: 'adminX' } } as any;
            service.update.mockReturnValue('upd');

            const res = controller.update('abc', dto, req);
            expect(service.update).toHaveBeenCalledWith('abc', {
                ...dto,
                updatedBy: 'adminX',
            });
            expect(res).toBe('upd');
        });
    });

    describe('remove()', () => {
        it('주어진 ID로 서비스.remove가 호출되어야 한다', () => {
            // 삭제 호출 검증
            service.remove.mockReturnValue(undefined);
            expect(controller.remove('toDel')).toBeUndefined();
            expect(service.remove).toHaveBeenCalledWith('toDel');
        });
    });
});
