import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RewardRequestDocument = RewardRequest & Document;

/** 요청 상태 enum */
export enum RewardRequestStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAIL = 'FAIL',
}

@Schema({ timestamps: true })
export class RewardRequest {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
    eventId: Types.ObjectId;

    @Prop({ default: () => new Date() })
    requestDate: Date;

    @Prop({ type: String, enum: RewardRequestStatus, default: RewardRequestStatus.PENDING })
    status: RewardRequestStatus;

    @Prop({ type: Object, default: {} })
    details: Record<string, any>;  // 검증 결과나 에러 메시지 등
}

export const RewardRequestSchema = SchemaFactory.createForClass(RewardRequest);
