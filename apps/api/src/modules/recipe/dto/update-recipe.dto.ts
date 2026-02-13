import { IsString, IsOptional, IsNumber, IsBoolean, Min, MaxLength } from 'class-validator';

export class UpdateRecipeDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    name?: string;

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
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    approvedBy?: string;
}
