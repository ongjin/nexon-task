import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: true })
export class Inventory {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    itemId: string;             // 예: 아이템 코드 또는 포인트 식별자

    @Prop({ default: 1 })
    quantity: number;

    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>;  // 추가 정보: 예를 들어 아이템 옵션 등

    @Prop({ default: () => new Date() })
    grantedAt: Date;

    @Prop({ required: true })
    createdBy: string;

    @Prop({ required: true })
    updatedBy: string;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
