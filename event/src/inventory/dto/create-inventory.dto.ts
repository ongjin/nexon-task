import { IsMongoId, IsString, IsNumber, Min, IsOptional, IsObject } from 'class-validator';

export class CreateInventoryDto {
    @IsMongoId()
    userId: string;

    @IsString()
    itemId: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}