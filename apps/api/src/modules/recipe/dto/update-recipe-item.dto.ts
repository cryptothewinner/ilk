import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateRecipeItemDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity?: number;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    wastagePercent?: number;

    @IsOptional()
    @IsString()
    notes?: string;
}
