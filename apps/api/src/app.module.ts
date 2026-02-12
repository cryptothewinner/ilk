import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StockModule } from './modules/stock/stock.module';
import { MetadataModule } from './modules/metadata/metadata.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { EventBusModule } from './events/event-bus.module';
import { ErpModule } from './modules/erp/erp.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthController } from './health.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        PrismaModule,
        EventBusModule,
        AuthModule,
        StockModule,
        MetadataModule,
        InventoryModule,
        ErpModule,
        AuditModule,
    ],
    controllers: [HealthController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule { }
