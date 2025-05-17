// src/reward-request/admin-reward-request.controller.ts (관리자용)
import { Controller, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/guard/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reward-requests')
export class RewardRequestController {
    constructor(private readonly proxyService: ProxyService) { }

    @Post()
    @Roles(Role.USER)
    create(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardRequest(req, res, 'reward-request');
    }

    @Get()
    @Roles(Role.USER)
    findAll(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardRequest(req, res, 'reward-request');
    }

    @Patch(':id/status')
    @Roles(Role.OPERATOR, Role.ADMIN)
    update(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
        return this.proxyService.forwardRequest(req, res, 'reward-request');
    }

}
