import { IsString, IsOptional, IsNumber, IsBoolean, Min, MaxLength } from 'class-validator';

export class UpdateStockDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    stockName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    barcode?: string;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    purchasePrice?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    salePrice?: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    currentStock?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minStockLevel?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    maxStockLevel?: number;

    @IsOptional()
    @IsString()
    warehouseCode?: string;

    @IsOptional()
    @IsNumber()
    vatRate?: number;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    brand?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    gtipCode?: string;
}
