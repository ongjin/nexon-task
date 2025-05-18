import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('events')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EventController {
    constructor(private readonly eventService: EventService) { }

    // 이벤트 생성 (OPERATOR, ADMIN)
    @Post()
    @Roles(Role.OPERATOR, Role.ADMIN)
    create(@Body() dto: CreateEventDto, @Request() req) {
        const eventData = {
            ...dto,
            createdBy: req.user.userId,
            updatedBy: req.user.userId,
        }
        return this.eventService.create(eventData);
    }

    // 리스트 조회 (모든 인증된 사용자)
    @Get()
    @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
    findAll() {
        return this.eventService.findAll();
    }

    // 상세 조회
    @Get(':id')
    @Roles(Role.USER, Role.OPERATOR, Role.AUDITOR, Role.ADMIN)
    findOne(@Param('id') id: string) {
        return this.eventService.findOne(id);
    }

    // 수정 (OPERATOR, ADMIN)
    @Patch(':id')
    @Roles(Role.OPERATOR, Role.ADMIN)
    update(@Param('id') id: string, @Body() dto: UpdateEventDto, @Request() req) {
        const eventData = {
            ...dto,
            updatedBy: req.user.userId,
        }
        return this.eventService.update(id, eventData);
    }

    // 삭제 (OPERATOR, ADMIN)
    @Delete(':id')
    @Roles(Role.OPERATOR, Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.eventService.remove(id);
    }
}
