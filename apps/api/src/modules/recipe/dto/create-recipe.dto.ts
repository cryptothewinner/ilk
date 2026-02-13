import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecipeItemInput {
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

export class CreateRecipeDto {
    @IsString()
    @MaxLength(20)
    code: string;

    @IsString()
    @MaxLength(200)
    name: string;

    @IsString()
    productId: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    batchSize?: number;

    @IsOptional()
    @IsString()
    batchUnit?: string;

    @IsOptional()
    @IsString()
    @MaxLength(5000)
    instructions?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRecipeItemInput)
    items?: CreateRecipeItemInput[];
}
