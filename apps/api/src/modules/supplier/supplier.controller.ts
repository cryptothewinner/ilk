import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('suppliers')
export class SupplierController {
    constructor(private readonly supplierService: SupplierService) { }

    @Get()
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(100), ParseIntPipe) pageSize: number,
        @Query('sortField') sortField?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
        @Query('search') search?: string,
        @Query('filters') filters?: string,
    ) {
        return this.supplierService.findAll({
            page, pageSize: Math.min(pageSize, 500), sortField, sortOrder, search,
            filters: filters ? JSON.parse(filters) : undefined,
        });
    }

    @Get('summary')
    async getSummary() {
        return this.supplierService.getSummary();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.supplierService.findOne(id);
    }

    @Post()
    async create(@Body() dto: CreateSupplierDto) {
        const supplier = await this.supplierService.create(dto);
        return { success: true, data: supplier };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
        const supplier = await this.supplierService.update(id, dto);
        return { success: true, data: supplier };
    }
}
