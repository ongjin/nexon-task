// -----------------------------------------------------------------------------
// UsersService 단위 테스트
// -----------------------------------------------------------------------------
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { Test, TestingModule } from '@nestjs/testing';

describe('UsersService', () => {
    let service: UsersService;
    let model: any;

    beforeEach(async () => {
        // Mongoose 모델 메서드를 Mock으로 설정
        const mockModel = {
            findOne: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis(),
            findByIdAndUpdate: jest.fn().mockReturnThis(),
            exec: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getModelToken(User.name), useValue: mockModel },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        model = module.get(getModelToken(User.name));
    });

    describe('findByEmail', () => {
        /**
         * 이메일로 사용자 조회 시
         * - 유저가 존재하면 해당 객체 반환
         * - 없으면 null 반환
         */
        it('should return a user when found', async () => {
            const user = { email: 'a' };
            model.exec.mockResolvedValue(user);

            expect(await service.findByEmail('a')).toBe(user);
            expect(model.findOne).toHaveBeenCalledWith({ email: 'a' });
        });

        it('should return null when not found', async () => {
            model.exec.mockResolvedValue(null);
            expect(await service.findByEmail('b')).toBeNull();
        });
    });

    describe('findAll', () => {
        /**
         * 전체 사용자 조회 시
         */
        it('should return array of users', async () => {
            const users = [{}, {}];
            model.exec.mockResolvedValue(users);

            expect(await service.findAll()).toBe(users);
            expect(model.find).toHaveBeenCalled();
        });
    });

    describe('updateRoles', () => {
        /**
         * 사용자 역할 업데이트 시
         * - 존재하는 사용자면 업데이트된 객체 반환
         * - 없으면 NotFoundException 발생
         */
        it('should update and return user when found', async () => {
            const updated = { id: '1', roles: ['admin'] };
            model.exec.mockResolvedValue(updated);

            expect(await service.updateRoles('1', ['admin'])).toBe(updated);
            expect(model.findByIdAndUpdate).toHaveBeenCalledWith('1', { roles: ['admin'] }, { new: true });
        });

        it('should throw NotFoundException when user not found', async () => {
            model.exec.mockResolvedValue(null);
            await expect(service.updateRoles('1', ['admin'])).rejects.toThrow(NotFoundException);
        });
    });
});
