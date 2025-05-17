// src/event/schemas/event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EventDocument = Event & Document;

export enum EventStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}


@Schema({ timestamps: true })
export class Event {
    @Prop({ required: true })
    name: string;

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    condition: Record<string, any>

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop({ type: String, enum: EventStatus, default: EventStatus.INACTIVE })
    status: EventStatus;

    @Prop({ required: true })
    createdBy: string;

    @Prop({ required: true })
    updatedBy: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);