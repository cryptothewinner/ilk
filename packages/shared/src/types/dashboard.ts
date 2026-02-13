import type { ProductionOrderStatus, BatchStatus } from './production';

export interface DashboardKpis {
    activeProducts: number;
    materialVarieties: number;
    releasedBatches: number;
    avgProfitMargin: number;
}

export interface ProductionStatusItem {
    status: ProductionOrderStatus;
    count: number;
}

export interface RecentActivityItem {
    id: string;
    batchNumber: string;
    status: BatchStatus;
    quantity: number;
    productionOrder?: {
        id: string;
        orderNumber: string;
    };
    createdAt: string;
}
