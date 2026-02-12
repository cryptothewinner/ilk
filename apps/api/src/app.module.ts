import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MetadataModule } from './modules/metadata/metadata.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AuditModule } from './modules/audit/audit.module';
import { ErpModule } from './modules/erp/erp.module';
import { EventBusModule } from './events/event-bus.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { HealthController } from './health.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../../.env'
        }),
        PrismaModule,
        AuthModule,
        MetadataModule,
        InventoryModule,
        AuditModule,
        ErpModule,
        EventBusModule,
    ],
    controllers: [HealthController],
    providers: [
        // Apply JWT guard globally; use @Public() to opt out
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule { }
