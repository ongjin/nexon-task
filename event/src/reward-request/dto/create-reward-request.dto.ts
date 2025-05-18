import { IsMongoId, IsOptional, IsObject } from 'class-validator';

export class CreateRewardRequestDto {
    @IsMongoId()
    eventId: string;

    @IsOptional()
    @IsObject()
    details?: Record<string, any>;
}
