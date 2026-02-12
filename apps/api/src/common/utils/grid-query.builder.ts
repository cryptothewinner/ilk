import { Prisma } from '@prisma/client';

interface SortItem {
    colId: string;
    sort: 'asc' | 'desc';
}

interface FilterItem {
    filterType: string;
    type?: string;
    filter?: any;
    filterTo?: any;
    values?: string[];
    dateFrom?: string;
    dateTo?: string;
    conditions?: FilterItem[];
    operator?: 'AND' | 'OR';
}

// Map AG Grid column IDs to Prisma field names (camelCase)
const COLUMN_MAP: Record<string, string> = {
    stockCode: 'stockCode',
    stockName: 'stockName',
    barcode: 'barcode',
    groupCode: 'groupCode',
    groupName: 'groupName',
    unit: 'unit',
    buyingPrice: 'buyingPrice',
    sellingPrice: 'sellingPrice',
    currency: 'currency',
    vatRate: 'vatRate',
    stockQuantity: 'stockQuantity',
    reservedQuantity: 'reservedQuantity',
    availableQuantity: 'availableQuantity',
    warehouseCode: 'warehouseCode',
    warehouseName: 'warehouseName',
    category: 'category',
    brand: 'brand',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
};

export class GridQueryBuilder {
    static buildOrderBy(sortModel?: SortItem[]): Record<string, 'asc' | 'desc'>[] {
        if (!sortModel || sortModel.length === 0) {
            return [{ stockCode: 'asc' }];
        }

        return sortModel
            .filter((s) => COLUMN_MAP[s.colId])
            .map((s) => ({
                [COLUMN_MAP[s.colId]]: s.sort,
            }));
    }

    static buildWhere(filterModel?: Record<string, FilterItem>): any {
        if (!filterModel || Object.keys(filterModel).length === 0) {
            return {};
        }

        const conditions: any[] = [];

        for (const [colId, filter] of Object.entries(filterModel)) {
            const field = COLUMN_MAP[colId];
            if (!field) continue;

            // Handle compound filters (AND/OR)
            if (filter.conditions && filter.operator) {
                const subConditions = filter.conditions
                    .map((c) => this.buildSingleFilter(field, c))
                    .filter(Boolean);

                if (subConditions.length > 0) {
                    if (filter.operator === 'OR') {
                        conditions.push({ OR: subConditions });
                    } else {
                        conditions.push({ AND: subConditions });
                    }
                }
                continue;
            }

            const condition = this.buildSingleFilter(field, filter);
            if (condition) {
                conditions.push(condition);
            }
        }

        if (conditions.length === 0) return {};
        if (conditions.length === 1) return conditions[0];
        return { AND: conditions };
    }

    private static buildSingleFilter(field: string, filter: FilterItem): any | null {
        switch (filter.filterType) {
            case 'text':
                return this.buildTextFilter(field, filter);
            case 'number':
                return this.buildNumberFilter(field, filter);
            case 'date':
                return this.buildDateFilter(field, filter);
            case 'set':
                return this.buildSetFilter(field, filter);
            default:
                return null;
        }
    }

    private static buildTextFilter(field: string, filter: FilterItem): any | null {
        const value = filter.filter;
        if (value === undefined || value === null || value === '') return null;

        const stringValue = String(value);

        switch (filter.type) {
            case 'contains':
                return { [field]: { contains: stringValue, mode: 'insensitive' } };
            case 'notContains':
                return { NOT: { [field]: { contains: stringValue, mode: 'insensitive' } } };
            case 'equals':
                return { [field]: { equals: stringValue, mode: 'insensitive' } };
            case 'notEqual':
                return { NOT: { [field]: { equals: stringValue, mode: 'insensitive' } } };
            case 'startsWith':
                return { [field]: { startsWith: stringValue, mode: 'insensitive' } };
            case 'endsWith':
                return { [field]: { endsWith: stringValue, mode: 'insensitive' } };
            case 'blank':
                return { OR: [{ [field]: null }, { [field]: '' }] };
            case 'notBlank':
                return { AND: [{ [field]: { not: null } }, { NOT: { [field]: '' } }] };
            default:
                return { [field]: { contains: stringValue, mode: 'insensitive' } };
        }
    }

    private static buildNumberFilter(field: string, filter: FilterItem): any | null {
        const value = filter.filter;

        switch (filter.type) {
            case 'equals':
                return { [field]: { equals: Number(value) } };
            case 'notEqual':
                return { [field]: { not: Number(value) } };
            case 'greaterThan':
                return { [field]: { gt: Number(value) } };
            case 'greaterThanOrEqual':
                return { [field]: { gte: Number(value) } };
            case 'lessThan':
                return { [field]: { lt: Number(value) } };
            case 'lessThanOrEqual':
                return { [field]: { lte: Number(value) } };
            case 'inRange':
                return {
                    [field]: {
                        gte: Number(value),
                        lte: Number(filter.filterTo),
                    },
                };
            case 'blank':
                return { [field]: null };
            case 'notBlank':
                return { [field]: { not: null } };
            default:
                return null;
        }
    }

    private static buildDateFilter(field: string, filter: FilterItem): any | null {
        switch (filter.type) {
            case 'equals':
                if (!filter.dateFrom) return null;
                return {
                    [field]: {
                        gte: new Date(filter.dateFrom),
                        lt: new Date(new Date(filter.dateFrom).getTime() + 86400000),
                    },
                };
            case 'greaterThan':
                if (!filter.dateFrom) return null;
                return { [field]: { gt: new Date(filter.dateFrom) } };
            case 'lessThan':
                if (!filter.dateFrom) return null;
                return { [field]: { lt: new Date(filter.dateFrom) } };
            case 'inRange':
                if (!filter.dateFrom || !filter.dateTo) return null;
                return {
                    [field]: {
                        gte: new Date(filter.dateFrom),
                        lte: new Date(filter.dateTo),
                    },
                };
            default:
                return null;
        }
    }

    private static buildSetFilter(field: string, filter: FilterItem): any | null {
        if (!filter.values || filter.values.length === 0) return null;

        // Handle boolean fields
        if (field === 'isActive') {
            const boolValues = filter.values.map((v: any) => {
                if (v === 'true' || v === true) return true;
                if (v === 'false' || v === false) return false;
                return !!v;
            });
            return { [field]: { in: boolValues } };
        }

        return { [field]: { in: filter.values } };
    }
}
