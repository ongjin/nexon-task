// src/reward-request/dto/create-reward-request.dto.ts
import { IsMongoId, IsOptional, IsObject } from 'class-validator';

export class CreateRewardRequestDto {
    @IsMongoId()
    eventId: string;

    @IsOptional()
    @IsObject()
    details?: Record<string, any>;
}
