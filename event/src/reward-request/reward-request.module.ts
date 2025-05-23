import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardRequestService } from './reward-request.service';
import { RewardRequestController } from './reward-request.controller';
import { RewardRequest, RewardRequestSchema } from './schemas/reward-request.schema';
import { RewardModule } from '../reward/reward.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RewardRequest.name, schema: RewardRequestSchema }]),
    RewardModule,
    InventoryModule,
  ],
  providers: [RewardRequestService],
  controllers: [RewardRequestController],
})
export class RewardRequestModule { }
