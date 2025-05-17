import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { Role } from '../common/enums/role.enum';
import { Roles } from 'src/guard/roles.decorator';

@Controller('event')
export class EventController {
    constructor(private readonly proxyService: ProxyService) { }

}
