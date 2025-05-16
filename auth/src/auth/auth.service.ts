import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    // 회원가입: 유저 생성 후 토큰 반환
    async register(dto: RegisterDto) {
        const user = await this.usersService.create(dto.email, dto.password);
        const payload = { sub: user.id, roles: user.roles };
        return { access_token: this.jwtService.sign(payload) };
    }

    // 로그인: 자격증명 확인 후 토큰 반환
    async login(dto: LoginDto) {
        const user = await this.usersService.validateUser(dto.email, dto.password);
        if (!user) {
            throw new UnauthorizedException('잘못된 이메일 또는 비밀번호입니다.');
        }
        const payload = { sub: user.id, roles: user.roles };
        return { access_token: this.jwtService.sign(payload) };
    }
}
