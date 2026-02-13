import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateRecipeItemDto {
    @IsString()
    materialId: string;

    @IsNumber()
    @Min(0)
    quantity: number;

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
