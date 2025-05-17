// src/reward/reward.controller.ts
import {
    Controller, Post, Get, Patch, Delete, Param, Req, Res, UseGuards
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/guard/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('events/:eventId/rewards')
export class RewardController {
    constructor(private readonly proxyService: ProxyService) { }

    @Post()
    @Roles(Role.OPERATOR, Role.ADMIN)
    create(@Req() req: Request, @Res() res: Response, @Param('eventId') eventId: string) {
        return this.proxyService.forwardRequest(req, res, 'reward');
    }

    @Get()
    @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
    findAll(@Req() req: Request, @Res() res: Response, @Param('eventId') eventId: string) {
        return this.proxyService.forwardRequest(req, res, 'reward');
    }

    @Get(':id')
    @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
    findOne(@Req() req: Request, @Res() res: Response, @Param('eventId') eventId: string, @Param('id') id: string) {
        return this.proxyService.forwardRequest(req, res, 'reward');
    }

    @Patch(':id')
    @Roles(Role.OPERATOR, Role.ADMIN)
    update(@Req() req: Request, @Res() res: Response, @Param('eventId') eventId: string, @Param('id') id: string) {
        return this.proxyService.forwardRequest(req, res, 'reward');
    }

    @Delete(':id')
    @Roles(Role.OPERATOR, Role.ADMIN)
    remove(@Req() req: Request, @Res() res: Response, @Param('eventId') eventId: string, @Param('id') id: string) {
        return this.proxyService.forwardRequest(req, res, 'reward');
    }
}
