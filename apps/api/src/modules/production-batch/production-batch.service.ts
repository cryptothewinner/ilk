import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BatchStatus } from '@prisma/client';

interface FindAllParams {
    page: number;
    pageSize: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, any>;
}

@Injectable()
export class ProductionBatchService {
    constructor(private readonly prisma: PrismaService) { }

    private async generateBatchNumber(): Promise<string> {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const prefix = `BAT-${dateStr}-`;

        const lastBatch = await this.prisma.productionBatch.findFirst({
            where: { batchNumber: { startsWith: prefix } },
            orderBy: { batchNumber: 'desc' },
        });

        let seq = 1;
        if (lastBatch) {
            const lastSeq = parseInt(lastBatch.batchNumber.split('-').pop() || '0', 10);
            seq = lastSeq + 1;
        }

        return `${prefix}${String(seq).padStart(3, '0')}`;
    }

    async findAll(params: FindAllParams) {
        const { page, pageSize, sortField, sortOrder, search, filters } = params;
        const skip = (page - 1) * pageSize;

        const where: Record<string, any> = {};

        if (search) {
            where.OR = [
                { batchNumber: { contains: search, mode: 'insensitive' } },
                { storageLocation: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } },
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
            orderBy.createdAt = 'desc';
        }

        const [data, total] = await Promise.all([
            this.prisma.productionBatch.findMany({
                where, orderBy: orderBy as any, skip, take: pageSize,
                include: { productionOrder: { select: { id: true, orderNumber: true } } },
            }),
            this.prisma.productionBatch.count({ where }),
        ]);

        return { success: true, data, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    }

    async findOne(id: string) {
        const batch = await this.prisma.productionBatch.findUnique({
            where: { id },
            include: { productionOrder: { include: { product: true, recipe: true } } },
        });
        if (!batch) throw new NotFoundException(`Parti bulunamadı: ${id}`);
        return batch;
    }

    async create(dto: any) {
        const batchNumber = await this.generateBatchNumber();
        const data: any = { ...dto, batchNumber };
        if (dto.manufacturingDate) data.manufacturingDate = new Date(dto.manufacturingDate);
        if (dto.expiryDate) data.expiryDate = new Date(dto.expiryDate);

        return this.prisma.productionBatch.create({
            data,
            include: { productionOrder: { select: { id: true, orderNumber: true } } },
        });
    }

    async update(id: string, dto: any) {
        await this.findOne(id);
        const data: any = { ...dto };
        if (dto.manufacturingDate) data.manufacturingDate = new Date(dto.manufacturingDate);
        if (dto.expiryDate) data.expiryDate = new Date(dto.expiryDate);
        if (dto.status) data.status = dto.status as BatchStatus;

        return this.prisma.productionBatch.update({ where: { id }, data });
    }

    async qcPass(id: string) {
        const batch = await this.findOne(id);
        if (batch.status !== 'QC_PENDING') {
            throw new BadRequestException(`KK onayı için parti durumu QC_PENDING olmalı. Mevcut: ${batch.status}`);
        }
        return this.prisma.productionBatch.update({
            where: { id },
            data: { status: 'QC_PASSED', qcDate: new Date() },
        });
    }

    async qcFail(id: string, qcNotes?: string) {
        const batch = await this.findOne(id);
        if (batch.status !== 'QC_PENDING') {
            throw new BadRequestException(`KK reddi için parti durumu QC_PENDING olmalı. Mevcut: ${batch.status}`);
        }
        return this.prisma.productionBatch.update({
            where: { id },
            data: { status: 'QC_FAILED', qcDate: new Date(), qcNotes },
        });
    }

    async release(id: string) {
        const batch = await this.findOne(id);
        if (batch.status !== 'QC_PASSED') {
            throw new BadRequestException(`Serbest bırakma için parti durumu QC_PASSED olmalı. Mevcut: ${batch.status}`);
        }
        return this.prisma.productionBatch.update({
            where: { id },
            data: { status: 'RELEASED' },
        });
    }

    async getSummary() {
        const [byStatusRaw, releasedCount, qcPassedCount, qcFailedCount] = await Promise.all([
            this.prisma.productionBatch.groupBy({ by: ['status'], _count: { id: true } }),
            this.prisma.productionBatch.count({ where: { status: 'RELEASED' } }),
            this.prisma.productionBatch.count({ where: { status: 'QC_PASSED' } }),
            this.prisma.productionBatch.count({ where: { status: 'QC_FAILED' } }),
        ]);

        const byStatus = byStatusRaw.map((item) => ({ status: item.status, count: item._count.id }));
        const qcTotal = qcPassedCount + qcFailedCount;
        const qcFailRate = qcTotal > 0 ? Math.round((qcFailedCount / qcTotal) * 10000) / 100 : 0;

        return {
            byStatus,
            releasedCount,
            qcPendingCount: byStatusRaw.find(i => i.status === 'QC_PENDING')?._count.id || 0,
            qcFailRate,
        };
    }
}
