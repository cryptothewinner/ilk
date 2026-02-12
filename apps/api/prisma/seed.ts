// apps/api/prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
    'Elektronik', 'Gıda', 'Tekstil', 'Kozmetik', 'Hırdavat',
    'Kırtasiye', 'Mobilya', 'Otomotiv', 'Beyaz Eşya', 'Temizlik',
];

const brands = [
    'Samsung', 'Apple', 'Ülker', 'Eti', 'LC Waikiki',
    'Nivea', 'Bosch', 'Faber Castell', 'İkea', 'Castrol',
    'Arçelik', 'Beko', 'Hayat', 'Pril', 'Colgate',
];

const units = ['Adet', 'Kg', 'Lt', 'Metre', 'Paket', 'Kutu', 'Düzine'];

function randomBetween(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function padNumber(num: number, length: number): string {
    return String(num).padStart(length, '0');
}

async function seedStocks() {
    console.log('🌱 Seeding 1000 stock items...');

    const stocks = Array.from({ length: 1000 }, (_, i) => {
        const idx = i + 1;
        const category = categories[i % categories.length];
        const brand = brands[i % brands.length];
        const unit = units[i % units.length];
        const purchasePrice = randomBetween(5, 5000);
        const salePrice = purchasePrice * randomBetween(1.1, 1.8);
        const vatRates = [1, 10, 20];

        return {
            stockCode: `STK-${padNumber(idx, 5)}`,
            stockName: `${brand} ${category} Ürün ${idx}`,
            barcode: `869${padNumber(Math.floor(Math.random() * 10000000000), 10)}`,
            groupCode: `GRP-${padNumber((i % 50) + 1, 3)}`,
            unitOfMeasure: unit,
            purchasePrice,
            salePrice: Math.round(salePrice * 100) / 100,
            vatRate: vatRates[i % vatRates.length],
            currentStock: randomBetween(0, 10000),
            minStockLevel: randomBetween(10, 100),
            maxStockLevel: randomBetween(1000, 50000),
            category,
            brand,
            isActive: Math.random() > 0.05, // 95% active
        };
    });

    // Batch insert with createMany
    await prisma.stock.createMany({
        data: stocks,
        skipDuplicates: true,
    });

    console.log('✅ 1000 stock items seeded.');
}

async function seedMetadata() {
    console.log('🌱 Seeding entity metadata for product-card...');

    // Delete existing metadata if any
    await prisma.entityMetadata.deleteMany({
        where: { slug: 'product-card' },
    });

    const entity = await prisma.entityMetadata.create({
        data: {
            slug: 'product-card',
            displayName: 'Ürün Kartı',
            description: 'Stok/Ürün kartı düzenleme formu',
            tableName: 'stocks',
            version: 1,
            fields: {
                create: [
                    // === Group: general-info ===
                    {
                        name: 'stockCode',
                        label: 'Stok Kodu',
                        fieldType: 'text',
                        placeholder: 'STK-00001',
                        required: true,
                        minLength: 3,
                        maxLength: 20,
                        group: 'general-info',
                        order: 1,
                        colSpan: 1,
                        disabled: true,
                        helpText: 'Stok kodu sistem tarafından atanır.',
                    },
                    {
                        name: 'stockName',
                        label: 'Stok Adı',
                        fieldType: 'text',
                        placeholder: 'Ürün adını girin',
                        required: true,
                        minLength: 2,
                        maxLength: 200,
                        group: 'general-info',
                        order: 2,
                        colSpan: 2,
                    },
                    {
                        name: 'barcode',
                        label: 'Barkod',
                        fieldType: 'text',
                        placeholder: '8690000000000',
                        required: false,
                        maxLength: 50,
                        group: 'general-info',
                        order: 3,
                        colSpan: 1,
                    },
                    {
                        name: 'groupCode',
                        label: 'Grup Kodu',
                        fieldType: 'text',
                        placeholder: 'GRP-001',
                        required: false,
                        maxLength: 20,
                        group: 'general-info',
                        order: 4,
                        colSpan: 1,
                    },
                    {
                        name: 'category',
                        label: 'Kategori',
                        fieldType: 'select',
                        required: false,
                        group: 'general-info',
                        order: 5,
                        colSpan: 1,
                        options: JSON.parse(JSON.stringify(
                            categories.map((c) => ({ label: c, value: c })),
                        )),
                    },
                    {
                        name: 'brand',
                        label: 'Marka',
                        fieldType: 'text',
                        placeholder: 'Marka adı',
                        required: false,
                        maxLength: 100,
                        group: 'general-info',
                        order: 6,
                        colSpan: 1,
                    },
                    {
                        name: 'unitOfMeasure',
                        label: 'Birim',
                        fieldType: 'select',
                        required: true,
                        group: 'general-info',
                        order: 7,
                        colSpan: 1,
                        options: JSON.parse(JSON.stringify(
                            units.map((u) => ({ label: u, value: u })),
                        )),
                    },
                    {
                        name: 'isActive',
                        label: 'Aktif',
                        fieldType: 'checkbox',
                        required: false,
                        defaultValue: true,
                        group: 'general-info',
                        order: 8,
                        colSpan: 1,
                    },

                    // === Group: pricing ===
                    {
                        name: 'purchasePrice',
                        label: 'Alış Fiyatı',
                        fieldType: 'currency',
                        placeholder: '0.00',
                        required: true,
                        min: 0,
                        max: 99999999,
                        group: 'pricing',
                        order: 10,
                        colSpan: 1,
                        helpText: 'KDV hariç alış fiyatı',
                    },
                    {
                        name: 'salePrice',
                        label: 'Satış Fiyatı',
                        fieldType: 'currency',
                        placeholder: '0.00',
                        required: true,
                        min: 0,
                        max: 99999999,
                        group: 'pricing',
                        order: 11,
                        colSpan: 1,
                        helpText: 'KDV hariç satış fiyatı',
                    },
                    {
                        name: 'vatRate',
                        label: 'KDV Oranı (%)',
                        fieldType: 'select',
                        required: true,
                        group: 'pricing',
                        order: 12,
                        colSpan: 1,
                        options: [
                            { label: '%1', value: 1 },
                            { label: '%10', value: 10 },
                            { label: '%20', value: 20 },
                        ] as any,
                    },

                    // === Group: stock-levels ===
                    {
                        name: 'currentStock',
                        label: 'Mevcut Stok',
                        fieldType: 'number',
                        placeholder: '0',
                        required: false,
                        min: 0,
                        group: 'stock-levels',
                        order: 20,
                        colSpan: 1,
                        disabled: true,
                        helpText: 'Mevcut stok miktarı. Fişlerle güncellenir.',
                    },
                    {
                        name: 'minStockLevel',
                        label: 'Minimum Stok',
                        fieldType: 'number',
                        placeholder: '0',
                        required: false,
                        min: 0,
                        group: 'stock-levels',
                        order: 21,
                        colSpan: 1,
                        helpText: 'Bu seviyenin altına düşünce uyarı verilir.',
                    },
                    {
                        name: 'maxStockLevel',
                        label: 'Maksimum Stok',
                        fieldType: 'number',
                        placeholder: '0',
                        required: false,
                        min: 0,
                        group: 'stock-levels',
                        order: 22,
                        colSpan: 1,
                    },
                ],
            },
        },
    });

    console.log(`✅ Entity metadata seeded: ${entity.slug} (${entity.id})`);
}

async function main() {
    try {
        await seedStocks();
        await seedMetadata();
        console.log('\n🎉 All seeds completed successfully!');
    } catch (error) {
        console.error('❌ Seed error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
