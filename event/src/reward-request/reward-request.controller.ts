// src/reward-request/reward-request.controller.ts
import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RewardRequestService } from './reward-request.service';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';
import { UpdateRewardRequestStatusDto } from './dto/update-reward-request-status.dto';
import { Role } from 'src/common/enums/role.enum';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RewardRequestController {
    constructor(private readonly reqService: RewardRequestService) { }

    /** USER: 조건 만족 후 보상 요청 */
    @Post('reward-requests')
    @Roles(Role.USER)
    create(@Request() req, @Body() dto: CreateRewardRequestDto) {
        return this.reqService.create(req.user.userId, dto);
    }

    /** USER: 본인 요청 내역 조회 */
    @Get('reward-requests')
    @Roles(Role.USER)
    findByUser(@Request() req) {
        return this.reqService.findByUser(req.user.userId);
    }

    /** ADMIN/OPERATOR/AUDITOR: 전체 요청 내역 조회 */
    @Get('admin/reward-requests')
    @Roles(Role.ADMIN, Role.OPERATOR, Role.AUDITOR)
    findAll() {
        return this.reqService.findAll();
    }

    /** OPERATOR/ADMIN: 요청 상태(success/fail) 업데이트 */
    @Patch('reward-requests/:id/status')
    @Roles(Role.OPERATOR, Role.ADMIN)
    updateStatus(@Param('id') id: string, @Body() dto: UpdateRewardRequestStatusDto, @Request() req) {
        return this.reqService.updateStatus(id, dto, req.user.userId);
    }
}
