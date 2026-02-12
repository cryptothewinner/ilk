import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
    imports: [
        HttpModule.register({
            baseURL: process.env.NETSIS_BRIDGE_URL || 'http://localhost:5295',
            timeout: 10000,
        }),
    ],
    controllers: [InventoryController],
    providers: [InventoryService],
    exports: [InventoryService],
})
export class InventoryModule { }
