import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, Min, MaxLength, IsInt } from 'class-validator';

export class CreateMaterialDto {
    @IsString()
    @MaxLength(20)
    code: string;

    @IsString()
    @MaxLength(200)
    name: string;

    @IsOptional()
    @IsString()
    type?: string; // RAW_MATERIAL, PACKAGING, SEMI_FINISHED, FINISHED_PRODUCT

    @IsOptional()
    @IsString()
    unitOfMeasure?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    unitPrice?: number;

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
    moq?: number;

    @IsOptional()
    @IsString()
    supplierId?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    casNumber?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    shelfLife?: number;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    storageCondition?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string;
}
