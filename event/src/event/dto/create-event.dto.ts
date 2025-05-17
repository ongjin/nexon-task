import { IsString, IsDateString, IsEnum, IsObject, ValidateNested, IsNumber } from 'class-validator';
import { EventStatus } from '../schemas/event.schema';
import { Type } from 'class-transformer';

class ConditionDto {
    @IsString()
    type: string;
    @IsNumber()
    value: number;
}

export class CreateEventDto {
    @IsString()
    name: string;

    @IsObject()
    @ValidateNested()
    @Type(() => ConditionDto)
    condition: ConditionDto;

    @IsDateString()
    startDate: string;  // ISO 문자열

    @IsDateString()
    endDate: string;    // ISO 문자열

    @IsEnum(EventStatus)
    status: EventStatus;
}
