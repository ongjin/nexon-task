// -----------------------------------------------------------------------------
// AuthService 단위 테스트
// -----------------------------------------------------------------------------
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: Partial<{ create: jest.Mock; validateUser: jest.Mock }>;
    let jwtService: Partial<JwtService>;

    beforeEach(async () => {
        // UsersService, JwtService를 Mock으로 주입
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: { create: jest.fn(), validateUser: jest.fn() } },
                { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('signedToken') } },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        usersService = module.get(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    describe('register', () => {
        /**
         * 회원가입 후 토큰 발급 검증
         * - UsersService.create()로 새 사용자 생성
         * - JwtService.sign()이 호출되어 access_token 반환
         */
        it('should register a user and return access token', async () => {
            const user = { id: '1', roles: ['user'] };
            (usersService.create as jest.Mock).mockResolvedValue(user);

            const result = await authService.register({ email: 'a', password: 'b' });
            expect(result).toEqual({ access_token: 'signedToken' });
            expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id, roles: user.roles });
        });
    });

    describe('login', () => {
        /**
         * 유효한 자격증명으로 로그인 시 토큰 발급 검증
         */
        it('should return token when credentials are valid', async () => {
            const user = { id: '1', roles: ['user'] };
            (usersService.validateUser as jest.Mock).mockResolvedValue(user);

            const result = await authService.login({ email: 'a', password: 'b' });
            expect(result).toEqual({ access_token: 'signedToken' });
            expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id, roles: user.roles });
        });

        /**
         * 잘못된 자격증명으로 로그인 시 UnauthorizedException 발생 검증
         */
        it('should throw UnauthorizedException when credentials are invalid', async () => {
            (usersService.validateUser as jest.Mock).mockResolvedValue(null);
            await expect(authService.login({ email: 'a', password: 'b' })).rejects.toThrow(UnauthorizedException);
        });
    });
});
