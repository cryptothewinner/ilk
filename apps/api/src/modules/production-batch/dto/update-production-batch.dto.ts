import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

class UpdateBatchConsumptionDto {
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

export class UpdateProductionBatchDto {
    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity?: number;

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
    @Type(() => UpdateBatchConsumptionDto)
    consumptions?: UpdateBatchConsumptionDto[];

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    qcNotes?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string;
}
