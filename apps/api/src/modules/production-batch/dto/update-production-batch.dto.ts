import { IsString, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';

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
}
