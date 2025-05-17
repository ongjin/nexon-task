import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';

@Injectable()
export class InventoryService {
    constructor(
        @InjectModel(Inventory.name) private invModel: Model<InventoryDocument>,
    ) { }

    /** 아이템/포인트 지급 */
    async addItem(
        userId: string,
        itemId: string,
        quantity: number,
        metadata: Record<string, any> = {},
    ): Promise<Inventory> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new NotFoundException('Invalid user ID');
        }
        const inv = new this.invModel({
            userId: new Types.ObjectId(userId),
            itemId,
            quantity,
            metadata,
            grantedAt: new Date(),
        });
        return inv.save();
    }

    /** 유저 인벤토리 조회 */
    async findByUser(userId: string): Promise<Inventory[]> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new NotFoundException('Invalid user ID');
        }
        return this.invModel.find({ userId: new Types.ObjectId(userId) }).exec();
    }
}