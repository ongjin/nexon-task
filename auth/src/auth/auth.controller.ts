import { Controller, Post, Body, UseGuards, Request, Get, Patch, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { ChangeRolesDto } from './dto/change-roles.dto';
import { UsersService } from '../users/users.service';
import { Role } from './role.enum';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    // 회원가입
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    // 로그인
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    // 프로필 조회 (Bearer 토큰 필요)
    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async profile(@Request() req) {
        // JwtStrategy.validate() 에서 반환한 { userId, roles } 객체가 req.user로 들어옵니다.
        return req.user;
    }

    // ADMIN만 접근 가능: 전체 유저 조회
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @Get('users')
    getAllUsers() {
        return this.usersService.findAll();
    }

    // ADMIN만 접근 가능: 역할 변경
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @Patch('users/:id/roles')
    changeUserRoles(
        @Param('id') id: string,
        @Body() dto: ChangeRolesDto,
    ) {
        return this.usersService.updateRoles(id, dto.roles);
    }
}
