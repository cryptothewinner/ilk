export interface StockItem {
    id: string;
    stockCode: string;
    stockName: string;
    barcode: string | null;
    unit: string;
    description: string | null;
    isActive: boolean;
    purchasePrice: number;
    salePrice: number;
    currency: string;
    currentStock: number;
    minStockLevel: number;
    maxStockLevel: number;
    warehouseCode: string | null;
    vatRate: number;
    category: string | null;
    brand: string | null;
    gtipCode: string | null;
    createdAt: string;
    updatedAt: string;
}

// Aliases for compatibility
export type StockItemDto = StockItem;

export interface StockSummary {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
}

export interface StockCreateDto {
    stockCode: string;
    stockName: string;
    barcode?: string;
    unit: string;
    description?: string;
    isActive?: boolean;
    purchasePrice: number;
    salePrice: number;
    currency?: string;
    currentStock?: number;
    minStockLevel?: number;
    maxStockLevel?: number;
    warehouseCode?: string;
    vatRate?: number;
    category?: string;
    brand?: string;
    gtipCode?: string;
}

export interface StockUpdateDto extends Partial<StockCreateDto> {
    id: string;
}

export interface StockPagedResponse {
    rows: StockItem[];
    totalCount: number;
    lastRow: number;
}
