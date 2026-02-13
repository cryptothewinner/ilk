import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, Min, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { CreateProductionBatchConsumptionInput } from './create-production-batch.dto';

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
    storageLocation?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    qcNotes?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProductionBatchConsumptionInput)
    consumptions?: CreateProductionBatchConsumptionInput[];
}
