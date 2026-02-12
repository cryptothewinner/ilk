import { IsOptional, IsNumber, IsArray, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ServerSideRequestDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    startRow: number = 0;

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    endRow: number = 100;

    @IsOptional()
    @IsArray()
    sortModel?: Array<{ colId: string; sort: 'asc' | 'desc' }>;

    @IsOptional()
    @IsObject()
    filterModel?: Record<string, any>;
}
