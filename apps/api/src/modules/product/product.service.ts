import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface FindAllParams {
    page: number;
    pageSize: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, any>;
}

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: FindAllParams) {
        const { page, pageSize, sortField, sortOrder, search, filters } = params;
        const skip = (page - 1) * pageSize;

        const where: Record<string, any> = {};

        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (filters) {
            for (const [key, filter] of Object.entries(filters)) {
                if (!filter) continue;
                if (filter.filterType === 'text') {
                    switch (filter.type) {
                        case 'contains': where[key] = { contains: filter.filter, mode: 'insensitive' }; break;
                        case 'equals': where[key] = filter.filter; break;
                        case 'startsWith': where[key] = { startsWith: filter.filter, mode: 'insensitive' }; break;
                        case 'endsWith': where[key] = { endsWith: filter.filter, mode: 'insensitive' }; break;
                    }
                } else if (filter.filterType === 'number') {
                    switch (filter.type) {
                        case 'equals': where[key] = filter.filter; break;
                        case 'greaterThan': where[key] = { gt: filter.filter }; break;
                        case 'lessThan': where[key] = { lt: filter.filter }; break;
                        case 'inRange': where[key] = { gte: filter.filter, lte: filter.filterTo }; break;
                    }
                }
            }
        }

        const orderBy: Record<string, 'asc' | 'desc'> = {};
        if (sortField) {
            orderBy[sortField as any] = sortOrder || 'asc';
        } else {
            orderBy.code = 'asc';
        }

        const [data, total] = await Promise.all([
            this.prisma.product.findMany({ where, orderBy: orderBy as any, skip, take: pageSize }),
            this.prisma.product.count({ where }),
        ]);

        return { success: true, data, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException(`Ürün bulunamadı: ${id}`);
        return product;
    }

    async create(dto: any) {
        return this.prisma.product.create({ data: dto });
    }

    async update(id: string, dto: any) {
        await this.findOne(id);
        return this.prisma.product.update({ where: { id }, data: dto });
    }

    async getSummary() {
        const [totalProducts, avgMarginResult, byCategory] = await Promise.all([
            this.prisma.product.count({ where: { isActive: true } }),
            this.prisma.product.aggregate({ where: { isActive: true }, _avg: { profitMargin: true } }),
            this.prisma.product.groupBy({ by: ['category'], where: { isActive: true }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }),
        ]);

        return {
            totalProducts,
            avgProfitMargin: Number(avgMarginResult._avg.profitMargin || 0),
            byCategory: byCategory.map((item) => ({ category: item.category || 'Diğer', count: item._count.id })),
        };
    }
}
