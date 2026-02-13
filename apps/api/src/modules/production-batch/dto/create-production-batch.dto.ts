import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

export class CreateBatchConsumptionDto {
    @IsString()
    materialBatchId: string;

    @IsNumber()
    @Min(0)
    quantity: number;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    materialStorageLocation?: string;
}

export class CreateProductionBatchDto {
    @IsString()
    productionOrderId: string;

    @IsNumber()
    @Min(0)
    quantity: number;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsString()
    manufacturingDate?: string;

    @IsOptional()
    @IsString()
    expiryDate?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    productionLocation?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateBatchConsumptionDto)
    consumptions?: CreateBatchConsumptionDto[];

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string;
}
