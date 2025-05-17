import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reward, RewardDocument, RewardType } from './schemas/reward.schema';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

@Injectable()
export class RewardService {
    constructor(
        @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    ) { }

    /**
   * 보상 등록: 이미 같은(eventId,type,metadata.itemId) 보상이 있으면
   * 수량(quantity)를 누적(update), 없으면 새로 생성(upsert)
   */
    async create(eventId: string, dto: CreateRewardDto): Promise<Reward> {
        // dto.metadata는 string → JSON.parse
        let meta: { itemId: string };
        try {
            meta = typeof dto.metadata === 'string'
                ? JSON.parse(dto.metadata)
                : dto.metadata;
        } catch {
            throw new BadRequestException('metadata가 올바른 JSON 문자열이 아닙니다.');
        }

        const filter = {
            eventId: new Types.ObjectId(eventId),
            type: dto.type,
            ...(dto.type === RewardType.ITEM && dto.metadata
                ? { 'metadata.itemId': dto.metadata.itemId }
                : {}),
        };

        const update = {
            $inc: { quantity: dto.quantity },
            $setOnInsert: {
                metadata: dto.metadata,
                createdAt: new Date(),
            },
            $set: { updatedAt: new Date() },
        };

        // upsert: true → 없으면 생성, new: true → 업데이트된/생성된 문서 반환
        const reward = await this.rewardModel
            .findOneAndUpdate(filter, update, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            })
            .exec();

        return reward;
    }

    async findAll(): Promise<Reward[]> {
        return this.rewardModel.find().exec();
    }

    async findByEvent(eventId: string): Promise<Reward[]> {
        if (!Types.ObjectId.isValid(eventId)) throw new NotFoundException('Invalid event ID');
        return this.rewardModel.find({ eventId: new Types.ObjectId(eventId) }).exec();
    }

    async findOne(id: string): Promise<Reward> {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid reward ID');
        const reward = await this.rewardModel.findById(id).exec();
        if (!reward) throw new NotFoundException('Reward not found');
        return reward;
    }

    async update(id: string, dto: UpdateRewardDto): Promise<Reward> {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid reward ID');
        const updated = await this.rewardModel
            .findByIdAndUpdate(
                id,
                {
                    ...(dto.type && { type: dto.type }),
                    ...(dto.quantity && { quantity: dto.quantity }),
                    ...(dto.metadata && { metadata: dto.metadata }),
                },
                { new: true },
            )
            .exec();
        if (!updated) throw new NotFoundException('Reward not found');
        return updated;
    }

    async remove(id: string): Promise<void> {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid reward ID');
        const res = await this.rewardModel.findByIdAndDelete(id).exec();
        if (!res) throw new NotFoundException('Reward not found');
    }
}