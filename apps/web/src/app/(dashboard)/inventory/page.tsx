'use client';

import React from 'react';
import {
    Package,
    TrendingUp,
    AlertTriangle,
    Database,
    Info,
    Download,
    Plus,
    RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { StockDataGrid } from '@/components/stock/stock-data-grid';
import { Button } from '@/components/ui/button';

export default function InventoryPage() {
    const { data: summaryResult, refetch, isFetching } = useQuery({
        queryKey: ['stock-summary'],
        queryFn: () => apiClient.get<any>('/stocks/summary'),
    });

    const summary = summaryResult?.data;

    return (
        <div className="flex flex-col min-h-screen">
            {/* Salesforce Page Header */}
            <header className="bg-white border-b border-lightning-border p-4 md:px-6 shadow-sm">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-[#f88962] rounded-md text-white shadow-sm">
                            <Package className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Envanter</p>
                            <h1 className="text-2xl font-bold text-slate-800 leading-tight">Mevcut Ürünler & Stok Yönetimi</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-lightning-border text-slate-700 hover:bg-slate-50 h-[32px] px-3 font-semibold"
                            onClick={() => refetch()}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                            Yenile
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-lightning-border text-slate-700 hover:bg-slate-50 h-[32px] px-3 font-semibold"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Dışa Aktar
                        </Button>
                        <Button
                            className="bg-lightning-blue hover:bg-lightning-blue-dark text-white h-[32px] px-4 font-bold rounded shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Yeni Ürün
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full">

                {/* Salesforce Style Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        label="TOPLAM ÜRÜN"
                        value={summary?.totalProducts ?? 0}
                        icon={<Database className="w-4 h-4 text-blue-500" />}
                        trend="+2% geçen aya göre"
                    />
                    <MetricCard
                        label="TOPLAM STOK DEĞERİ"
                        value={`${(summary?.totalValue ?? 0).toLocaleString('tr-TR')} ₺`}
                        icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                        positive
                    />
                    <MetricCard
                        label="KRİTİK STOK"
                        value={summary?.lowStockCount ?? 0}
                        icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                        warning={summary?.lowStockCount > 0}
                    />
                    <MetricCard
                        label="STOKTA KALMAYAN"
                        value={summary?.outOfStockCount ?? 0}
                        icon={<Info className="w-4 h-4 text-rose-500" />}
                        danger={summary?.outOfStockCount > 0}
                    />
                </div>

                {/* Main Work Area - The Data Grid */}
                <div className="bg-white rounded border border-lightning-border shadow-sm min-h-[600px] flex flex-col overflow-hidden">
                    <StockDataGrid />
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon, trend, positive, warning, danger }: any) {
    return (
        <div className="bg-white p-4 border border-lightning-border rounded shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                {icon}
            </div>
            <div className="flex items-end justify-between">
                <h3 className={`text-2xl font-bold ${danger ? 'text-rose-600' : warning ? 'text-amber-600' : 'text-slate-800'}`}>
                    {value}
                </h3>
            </div>
            {trend && (
                <p className={`text-[11px] mt-2 font-medium ${positive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {trend}
                </p>
            )}
        </div>
    );
}
