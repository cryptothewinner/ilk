import { IsString, IsOptional, IsNumber, IsInt, Min, MaxLength } from 'class-validator';

export class UpdateProductionOrderDto {
    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    plannedQuantity?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    actualQuantity?: number;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    priority?: number;

    @IsOptional()
    @IsString()
    plannedStart?: string;

    @IsOptional()
    @IsString()
    plannedEnd?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    assignedTo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string;
}
