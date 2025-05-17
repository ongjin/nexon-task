// src/reward-request/reward-request.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    RewardRequest,
    RewardRequestDocument,
    RewardRequestStatus,
} from './schemas/reward-request.schema';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';
import { UpdateRewardRequestStatusDto } from './dto/update-reward-request-status.dto';
import { RewardService } from 'src/reward/reward.service';
import { InventoryService } from 'src/inventory/inventory.service';

@Injectable()
export class RewardRequestService {
    constructor(
        @InjectModel(RewardRequest.name)
        private reqModel: Model<RewardRequestDocument>,
        private readonly rewardService: RewardService,
        private readonly inventoryService: InventoryService,
    ) { }

    /** 사용자 요청 생성 */
    async create(userId: string, dto: CreateRewardRequestDto): Promise<RewardRequest> {
        if (!Types.ObjectId.isValid(dto.eventId)) {
            throw new BadRequestException('Invalid event ID');
        }

        // 1) 중복 요청 방지: 상태 상관 없이 이미 요청된 적이 있는지 체크
        const exists = await this.reqModel
            .findOne({
                userId: new Types.ObjectId(userId),
                eventId: new Types.ObjectId(dto.eventId),
            })
            .exec();

        if (exists) {
            throw new ConflictException('이미 보상 요청을 하셨습니다.');
        }

        // 2) 이벤트 기간 검증 등 기존 로직
        //    …

        const created = new this.reqModel({
            userId: new Types.ObjectId(userId),
            eventId: new Types.ObjectId(dto.eventId),
            details: dto.details || {},
            status: RewardRequestStatus.PENDING,
        });
        return created.save();
    }

    /** 본인 요청 내역 조회 */
    async findByUser(userId: string): Promise<RewardRequest[]> {
        return this.reqModel.find({ userId: new Types.ObjectId(userId) }).exec();
    }

    /** 전체 요청 조회 (ADMIN, OPERATOR, AUDITOR) */
    async findAll(): Promise<RewardRequest[]> {
        return this.reqModel.find().exec();
    }

    /** 요청 상태 변경 */
    async updateStatus(id: string, dto: UpdateRewardRequestStatusDto, adminId: string): Promise<RewardRequest> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('Invalid request ID');
        }
        const prev = await this.reqModel.findById(id).exec();
        if (!prev) throw new NotFoundException('Request not found');

        // 상태 업데이트
        const updated = await this.reqModel
            .findByIdAndUpdate(id, { status: dto.status }, { new: true })
            .exec();
        // 보상 요청이 성공으로 바뀌었고, 이전엔 SUCCESS가 아니었다면 인벤토리 지급
        if (
            dto.status === RewardRequestStatus.SUCCESS &&
            prev.status !== RewardRequestStatus.SUCCESS
        ) {
            // 이벤트에 설정된 reward 목록을 가져와서 하나씩 인벤토리에 추가
            const rewards = await this.rewardService.findByEvent(prev.eventId.toString());
            for (const rw of rewards) {
                await this.inventoryService.addItem(
                    prev.userId.toString(),
                    rw.metadata.itemId || rw.type,  // 포인트면 type, 아이템이면 itemId
                    rw.quantity,
                    rw.metadata,
                    adminId
                );
            }
        }
        return updated!;
    }
}
