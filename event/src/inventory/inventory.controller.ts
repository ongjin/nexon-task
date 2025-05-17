import { Controller, Post, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { Role } from 'src/common/enums/role.enum';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InventoryController {
    constructor(private readonly invService: InventoryService) { }

    // OPERATOR, ADMIN: 유저에 아이템/포인트 지급
    @Post()
    @Roles(Role.OPERATOR, Role.ADMIN)
    addItem(@Body() dto: CreateInventoryDto) {
        return this.invService.addItem(
            dto.userId,
            dto.itemId,
            dto.quantity,
            dto.metadata || {},
        );
    }

    // USER: 본인 인벤토리 조회
    @Get()
    @Roles(Role.USER, Role.ADMIN, Role.OPERATOR, Role.AUDITOR)
    getMyInventory(@Request() req) {
        return this.invService.findByUser(req.user.userId);
    }

    // ADMIN/OPERATOR/AUDITOR: 특정 유저 인벤토리 조회
    @Get(':userId')
    @Roles(Role.ADMIN, Role.OPERATOR, Role.AUDITOR)
    getUserInventory(@Param('userId') userId: string) {
        return this.invService.findByUser(userId);
    }
}