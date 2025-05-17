// src/reward/schemas/reward.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RewardDocument = Reward & Document;

/** 보상 유형 enum */
export enum RewardType {
    POINT = 'POINT',
    ITEM = 'ITEM',
    COUPON = 'COUPON',
}

@Schema({ timestamps: true })
export class Reward {
    @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
    eventId: Types.ObjectId;

    @Prop({ type: String, enum: RewardType, required: true })
    type: RewardType;

    @Prop({ required: true })
    quantity: number;

    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>;  // itemId, couponCode 등
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
