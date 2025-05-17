// src/reward-request/reward-request.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardRequestService } from './reward-request.service';
import { RewardRequestController } from './reward-request.controller';
import { RewardRequest, RewardRequestSchema } from './schemas/reward-request.schema';
import { RewardModule } from 'src/reward/reward.module';
import { InventoryModule } from 'src/inventory/inventory.module';

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
