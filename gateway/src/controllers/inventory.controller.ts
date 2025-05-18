import {
    Controller, Post, Get, Param, Req, Res, UseGuards
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/guard/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('inventory')
export class InventoryController {
    constructor(private readonly proxyService: ProxyService) { }

    @Post()
    @Roles(Role.OPERATOR, Role.ADMIN)
    create(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardRequest(req, res, 'inventory');
    }

    @Get()
    @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
    findMyInventory(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardRequest(req, res, 'inventory');
    }

    @Get(':userId')
    @Roles(Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
    findUserInventory(@Req() req: Request, @Res() res: Response, @Param('userId') userId: string) {
        return this.proxyService.forwardRequest(req, res, 'inventory');
    }
}
