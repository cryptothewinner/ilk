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
export class RecipeService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: FindAllParams) {
        const { page, pageSize, sortField, sortOrder, search, filters } = params;
        const skip = (page - 1) * pageSize;

        const where: Record<string, any> = {};

        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
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
            this.prisma.recipe.findMany({
                where, orderBy: orderBy as any, skip, take: pageSize,
                include: { product: { select: { id: true, code: true, name: true } } },
            }),
            this.prisma.recipe.count({ where }),
        ]);

        return { success: true, data, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    }

    async findOne(id: string) {
        const recipe = await this.prisma.recipe.findUnique({
            where: { id },
            include: {
                product: true,
                items: { include: { material: true }, orderBy: { order: 'asc' } },
            },
        });
        if (!recipe) throw new NotFoundException(`Reçete bulunamadı: ${id}`);
        return recipe;
    }

    async create(dto: any) {
        const { items, ...recipeData } = dto;

        return this.prisma.$transaction(async (tx) => {
            const recipe = await tx.recipe.create({ data: recipeData });

            if (items && items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const material = await tx.material.findUnique({ where: { id: item.materialId } });
                    const unitCost = material ? Number(material.unitPrice) : 0;
                    const wastage = item.wastagePercent || 0;
                    const totalCost = item.quantity * unitCost * (1 + wastage / 100);

                    await tx.recipeItem.create({
                        data: {
                            recipeId: recipe.id,
                            materialId: item.materialId,
                            quantity: item.quantity,
                            unit: item.unit || 'Kg',
                            wastagePercent: wastage,
                            unitCost,
                            totalCost,
                            notes: item.notes,
                            order: i + 1,
                        },
                    });
                }

                // Update recipe total cost
                const allItems = await tx.recipeItem.findMany({ where: { recipeId: recipe.id } });
                const totalRecipeCost = allItems.reduce((acc, it) => acc + Number(it.totalCost), 0);
                await tx.recipe.update({ where: { id: recipe.id }, data: { totalCost: totalRecipeCost } });
            }

            return tx.recipe.findUnique({ where: { id: recipe.id }, include: { product: true, items: { include: { material: true } } } });
        });
    }

    async update(id: string, dto: any) {
        await this.findOne(id);
        return this.prisma.recipe.update({ where: { id }, data: dto });
    }

    async addItem(recipeId: string, dto: any) {
        await this.findOne(recipeId);
        const material = await this.prisma.material.findUnique({ where: { id: dto.materialId } });
        const unitCost = material ? Number(material.unitPrice) : 0;
        const wastage = dto.wastagePercent || 0;
        const totalCost = dto.quantity * unitCost * (1 + wastage / 100);

        const itemCount = await this.prisma.recipeItem.count({ where: { recipeId } });

        const item = await this.prisma.recipeItem.create({
            data: {
                recipeId,
                materialId: dto.materialId,
                quantity: dto.quantity,
                unit: dto.unit || 'Kg',
                wastagePercent: wastage,
                unitCost,
                totalCost,
                notes: dto.notes,
                order: itemCount + 1,
            },
            include: { material: true },
        });

        await this.recalculateCost(recipeId);
        return item;
    }

    async updateItem(recipeId: string, itemId: string, dto: any) {
        const item = await this.prisma.recipeItem.findUnique({ where: { id: itemId }, include: { material: true } });
        if (!item || item.recipeId !== recipeId) throw new NotFoundException(`Reçete satırı bulunamadı: ${itemId}`);

        const quantity = dto.quantity !== undefined ? dto.quantity : Number(item.quantity);
        const wastage = dto.wastagePercent !== undefined ? dto.wastagePercent : Number(item.wastagePercent);
        const unitCost = Number(item.material.unitPrice);
        const totalCost = quantity * unitCost * (1 + wastage / 100);

        const updated = await this.prisma.recipeItem.update({
            where: { id: itemId },
            data: { ...dto, unitCost, totalCost },
            include: { material: true },
        });

        await this.recalculateCost(recipeId);
        return updated;
    }

    async removeItem(recipeId: string, itemId: string) {
        const item = await this.prisma.recipeItem.findUnique({ where: { id: itemId } });
        if (!item || item.recipeId !== recipeId) throw new NotFoundException(`Reçete satırı bulunamadı: ${itemId}`);

        await this.prisma.recipeItem.delete({ where: { id: itemId } });
        await this.recalculateCost(recipeId);
        return { success: true };
    }

    async recalculateCost(recipeId: string) {
        const items = await this.prisma.recipeItem.findMany({
            where: { recipeId },
            include: { material: true },
        });

        let totalRecipeCost = 0;
        for (const item of items) {
            const unitCost = Number(item.material.unitPrice);
            const totalCost = Number(item.quantity) * unitCost * (1 + Number(item.wastagePercent) / 100);
            await this.prisma.recipeItem.update({
                where: { id: item.id },
                data: { unitCost, totalCost },
            });
            totalRecipeCost += totalCost;
        }

        const recipe = await this.prisma.recipe.update({
            where: { id: recipeId },
            data: { totalCost: totalRecipeCost },
            include: { items: { include: { material: true } } },
        });

        return recipe;
    }

    async getSummary() {
        const [totalRecipes, activeRecipes, avgCostResult] = await Promise.all([
            this.prisma.recipe.count(),
            this.prisma.recipe.count({ where: { isActive: true } }),
            this.prisma.recipe.aggregate({ _avg: { totalCost: true } }),
        ]);

        return {
            totalRecipes,
            activeRecipes,
            avgCost: Number(avgCostResult._avg.totalCost || 0),
        };
    }
}
