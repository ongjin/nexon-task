import { IsEnum } from 'class-validator';
import { RewardRequestStatus } from '../schemas/reward-request.schema';

export class UpdateRewardRequestStatusDto {
    @IsEnum(RewardRequestStatus)
    status: RewardRequestStatus;
}
