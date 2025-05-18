// -----------------------------------------------------------------------------
// AuthController 단위 테스트
// -----------------------------------------------------------------------------
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;
    let usersService: UsersService;

    beforeEach(async () => {
        // TestingModule을 구성하고 AuthService, UsersService를 Mock으로 주입
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: { register: jest.fn(), login: jest.fn() } },
                { provide: UsersService, useValue: { findAll: jest.fn(), updateRoles: jest.fn() } },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
    });

    describe('register', () => {
        /**
         * 회원가입(register) 호출 시
         * - AuthService.register(dto) 호출 여부
         * - 반환값이 Controller에서 그대로 리턴되는지 검증
         */
        it('should call authService.register with dto', async () => {
            const dto = { email: 'test@test.com', password: 'pass' };
            (authService.register as jest.Mock).mockResolvedValue('result');

            const result = await authController.register(dto);
            expect(result).toBe('result');
            expect(authService.register).toHaveBeenCalledWith(dto);
        });
    });

    describe('login', () => {
        /**
         * 로그인(login) 호출 시
         * - AuthService.login(dto) 호출 여부
         * - 반환된 토큰을 그대로 리턴하는지 검증
         */
        it('should call authService.login with dto', async () => {
            const dto = { email: 'test@test.com', password: 'pass' };
            (authService.login as jest.Mock).mockResolvedValue('token');

            const result = await authController.login(dto);
            expect(result).toBe('token');
            expect(authService.login).toHaveBeenCalledWith(dto);
        });
    });

    describe('profile', () => {
        /**
         * 프로파일 조회(profile) 호출 시
         * - 요청 객체(req)의 user 프로퍼티를 그대로 반환하는지 검증
         */
        it('should return req.user', async () => {
            const req = { user: { userId: '1', roles: ['user'] } };
            const result = await (authController as any).profile(req);

            expect(result).toEqual(req.user);
        });
    });

    describe('getAllUsers', () => {
        /**
         * 전체 사용자 조회(getAllUsers) 호출 시
         * - UsersService.findAll() 호출 여부 및 반환값 검증
         */
        it('should call usersService.findAll', () => {
            (usersService.findAll as jest.Mock).mockReturnValue(['user1']);

            const result = authController.getAllUsers();
            expect(result).toEqual(['user1']);
            expect(usersService.findAll).toHaveBeenCalled();
        });
    });

    describe('changeUserRoles', () => {
        /**
         * 사용자 역할 변경(changeUserRoles) 호출 시
         * - UsersService.updateRoles(id, roles) 호출 여부 및 반환값 검증
         */
        it('should call usersService.updateRoles', () => {
            const id = '1';
            const roles = ['admin'];
            (usersService.updateRoles as jest.Mock).mockReturnValue('updatedUser');

            const result = authController.changeUserRoles(id, { roles });
            expect(result).toBe('updatedUser');
            expect(usersService.updateRoles).toHaveBeenCalledWith(id, roles);
        });
    });
});