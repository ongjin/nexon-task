import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/guard/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('admin/reward-requests')
export class AdminRewardRequestController {
    constructor(private readonly proxyService: ProxyService) { }

    @Get()
    @Roles(Role.ADMIN, Role.OPERATOR, Role.AUDITOR)
    findAll(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardRequest(req, res, 'reward-request');
    }
}
