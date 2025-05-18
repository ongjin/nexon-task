import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory, InventorySchema } from './schemas/inventory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Inventory.name, schema: InventorySchema }]),
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],  // RewardRequest나 Reward 서비스에서 주입할 수 있도록 export
})
export class InventoryModule { }
