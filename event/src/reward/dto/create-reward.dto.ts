import { IsString, IsEnum, IsNumber, IsMongoId, Min, IsObject, ValidateNested } from 'class-validator';
import { RewardType } from '../schemas/reward.schema';
import { Type } from 'class-transformer';

class MetadataDto {
    @IsString()
    itemId: string;
}

export class CreateRewardDto {
    // @IsMongoId()
    // eventId: string;

    @IsEnum(RewardType)
    type: RewardType;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsObject()
    @ValidateNested()
    @Type(() => MetadataDto)
    metadata: MetadataDto;
}
