import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('events/:eventId/rewards')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RewardController {
    constructor(private readonly rewardService: RewardService) { }

    // 해당 이벤트 보상 등록 (OPERATOR, ADMIN)
    @Post()
    @Roles(Role.OPERATOR, Role.ADMIN)
    create(@Param('eventId') eventId: string, @Body() dto: CreateRewardDto) {
        return this.rewardService.create(eventId, dto);
    }

    // 해당 이벤트 보상 목록 조회 (모든 인증된 사용자)
    @Get()
    @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
    findByEvent(@Param('eventId') eventId: string) {
        return this.rewardService.findByEvent(eventId);
    }

    // 보상 상세 조회
    @Get(':id')
    @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
    findOne(@Param('id') id: string) {
        return this.rewardService.findOne(id);
    }

    // 보상 수정 (OPERATOR, ADMIN)
    @Patch(':id')
    @Roles(Role.OPERATOR, Role.ADMIN)
    update(@Param('id') id: string, @Body() dto: UpdateRewardDto) {
        return this.rewardService.update(id, dto);
    }

    // 보상 삭제 (OPERATOR, ADMIN)
    @Delete(':id')
    @Roles(Role.OPERATOR, Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.rewardService.remove(id);
    }
}