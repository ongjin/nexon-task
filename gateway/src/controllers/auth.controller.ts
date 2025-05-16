import { All, Controller, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { Roles } from 'src/guard/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guard/roles.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly proxyService: ProxyService) { }

    // 회원가입
    @Post('register')
    register(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardRequest(req, res, 'auth');
    }

    // 로그인
    @Post('login')
    login(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardRequest(req, res, 'auth');
    }

    // 프로필 조회
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.USER, Role.ADMIN, Role.OPERATOR, Role.AUDITOR)
    @Get('profile')
    getProfile(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardRequest(req, res, 'auth');
    }

    // 전체 사용자 조회
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @Get('users')
    getUsers(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardRequest(req, res, 'auth');
    }

    // 역할 변경
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @Patch('users/:id/roles')
    changeUserRoles(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardRequest(req, res, 'auth');
    }

    // @All('*')
    // fallback(@Req() req: Request, @Res() res: Response) {
    //     return this.proxyService.forwardRequest(req, res, 'auth');
    // }
}
