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
export class SupplierService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: FindAllParams) {
        const { page, pageSize, sortField, sortOrder, search, filters } = params;
        const skip = (page - 1) * pageSize;

        const where: Record<string, any> = {};

        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                { contactPerson: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
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
            this.prisma.supplier.findMany({ where, orderBy: orderBy as any, skip, take: pageSize }),
            this.prisma.supplier.count({ where }),
        ]);

        return { success: true, data, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    }

    async findOne(id: string) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id }, include: { materials: true } });
        if (!supplier) throw new NotFoundException(`Tedarikçi bulunamadı: ${id}`);
        return supplier;
    }

    async create(dto: any) {
        return this.prisma.supplier.create({ data: dto });
    }

    async update(id: string, dto: any) {
        await this.findOne(id);
        return this.prisma.supplier.update({ where: { id }, data: dto });
    }

    async getSummary() {
        const [totalSuppliers, allSuppliers] = await Promise.all([
            this.prisma.supplier.count({ where: { isActive: true } }),
            this.prisma.supplier.findMany({ where: { isActive: true }, select: { leadTimeDays: true } }),
        ]);

        const avgLeadTime = allSuppliers.length > 0
            ? allSuppliers.reduce((acc, s) => acc + (s.leadTimeDays || 0), 0) / allSuppliers.length
            : 0;

        return { totalSuppliers, avgLeadTime: Math.round(avgLeadTime * 10) / 10 };
    }
}
