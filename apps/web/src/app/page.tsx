'use client';

import React, { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
    LayoutDashboard, Package, Layers, FlaskConical, TrendingUp,
    Factory, BookOpen, Plus, ArrowRight, RefreshCw, Activity,
    CheckCircle, Clock, AlertTriangle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboardKpis, useProductionStatus, useRecentActivity } from '@/hooks/use-dashboard';

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    DRAFT: {
        label: 'Taslak',
        color: 'text-slate-600',
        bg: 'bg-slate-100',
        icon: <Clock className="w-4 h-4 text-slate-500" />,
    },
    PLANNED: {
        label: 'Planlandı',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        icon: <Clock className="w-4 h-4 text-blue-500" />,
    },
    IN_PROGRESS: {
        label: 'Devam Ediyor',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        icon: <Activity className="w-4 h-4 text-amber-500" />,
    },
    COMPLETED: {
        label: 'Tamamlandı',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    },
    CANCELLED: {
        label: 'İptal',
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        icon: <XCircle className="w-4 h-4 text-rose-500" />,
    },
};

const BADGE_COLORS: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
    PLANNED: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

function getStatusLabel(status: string): string {
    return STATUS_CONFIG[status]?.label ?? status;
}

/* ------------------------------------------------------------------ */
/*  Skeleton / shimmer component                                       */
/* ------------------------------------------------------------------ */

function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
    );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
    const queryClient = useQueryClient();
    const { data: kpiData, isLoading: kpiLoading, isError: kpiError } = useDashboardKpis();
    const { data: statusData, isLoading: statusLoading, isError: statusError } = useProductionStatus();
    const { data: activityData, isLoading: activityLoading, isError: activityError } = useRecentActivity();

    const kpis = kpiData?.data ?? kpiData ?? {};
    const statuses: Record<string, number> = useMemo(() => {
        const rawData = statusData?.data ?? statusData;
        if (!rawData) return {};
        if (Array.isArray(rawData)) {
            return rawData.reduce((acc: any, item: any) => {
                acc[item.status] = item.count;
                return acc;
            }, {});
        }
        return rawData;
    }, [statusData]);
    const activities: any[] = activityData?.data ?? activityData ?? [];

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* ── Header ─────────────────────────────────────────── */}
            <header className="bg-white border-b border-lightning-border p-4 md:px-6 shadow-sm">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-lightning-blue rounded-md text-white">
                            <LayoutDashboard className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Dashboard
                            </p>
                            <h1 className="text-2xl font-bold text-slate-800 leading-tight">
                                SepeNatural 2026
                            </h1>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Üretim Yönetim Sistemi
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="gap-2 text-slate-600 hover:text-lightning-blue"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Yenile
                    </Button>
                </div>
            </header>

            {/* ── Content ────────────────────────────────────────── */}
            <div className="flex-1 p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full">

                {/* ── KPI Cards ──────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        label="Aktif Ürünler"
                        value={kpis.activeProducts}
                        icon={<Package className="w-5 h-5" />}
                        accentColor="blue"
                        loading={kpiLoading}
                        error={kpiError}
                    />
                    <KpiCard
                        label="Hammadde Çeşidi"
                        value={kpis.materialVarieties}
                        icon={<Layers className="w-5 h-5" />}
                        accentColor="teal"
                        loading={kpiLoading}
                        error={kpiError}
                    />
                    <KpiCard
                        label="Serbest Bırakılan Partiler"
                        value={kpis.releasedBatches}
                        icon={<FlaskConical className="w-5 h-5" />}
                        accentColor="emerald"
                        loading={kpiLoading}
                        error={kpiError}
                    />
                    <KpiCard
                        label="Ort. Kar Marjı"
                        value={
                            kpis.avgProfitMargin != null
                                ? `%${Number(kpis.avgProfitMargin).toFixed(1)}`
                                : undefined
                        }
                        icon={<TrendingUp className="w-5 h-5" />}
                        accentColor="amber"
                        loading={kpiLoading}
                        error={kpiError}
                    />
                </div>

                {/* ── Two-column: Production Status + Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Production Status */}
                    <div className="bg-white border border-lightning-border rounded shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-lightning-border bg-slate-50 flex items-center gap-2">
                            <Factory className="w-4 h-4 text-slate-500" />
                            <h3 className="font-bold text-slate-800">Üretim Durumu</h3>
                        </div>

                        <div className="p-4">
                            {statusLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="h-20" />
                                    ))}
                                </div>
                            ) : statusError ? (
                                <div className="flex items-center gap-2 text-sm text-slate-400 py-6 justify-center">
                                    <AlertTriangle className="w-4 h-4" />
                                    Veri yüklenemedi
                                </div>
                            ) : Object.keys(statuses).length === 0 ? (
                                <div className="text-sm text-slate-400 py-6 text-center">
                                    Henüz üretim verisi yok
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {Object.entries(statuses).map(([status, count]) => {
                                        const cfg = STATUS_CONFIG[status];
                                        if (!cfg) return null;
                                        return (
                                            <div
                                                key={status}
                                                className={`rounded-lg border p-3 flex flex-col items-center gap-1.5 ${cfg.bg} border-transparent`}
                                            >
                                                {cfg.icon}
                                                <span className="text-2xl font-black text-slate-800">
                                                    {count}
                                                </span>
                                                <span className={`text-[11px] font-semibold uppercase tracking-wider ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white border border-lightning-border rounded shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-lightning-border bg-slate-50 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-500" />
                            <h3 className="font-bold text-slate-800">Son Aktiviteler</h3>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {activityLoading ? (
                                <div className="p-4 space-y-3">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton key={i} className="h-12" />
                                    ))}
                                </div>
                            ) : activityError ? (
                                <div className="flex items-center gap-2 text-sm text-slate-400 py-8 justify-center">
                                    <AlertTriangle className="w-4 h-4" />
                                    Veri yüklenemedi
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="text-sm text-slate-400 py-8 text-center">
                                    Henüz aktivite yok
                                </div>
                            ) : (
                                activities.map((item: any, idx: number) => (
                                    <div
                                        key={item.id ?? idx}
                                        className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-bold text-slate-800 truncate">
                                                    {item.batchNumber ?? '--'}
                                                </span>
                                                {item.status && (
                                                    <Badge
                                                        className={`text-[10px] px-1.5 py-0 border ${BADGE_COLORS[item.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                                                    >
                                                        {getStatusLabel(item.status)}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                {item.quantity != null && (
                                                    <span>Miktar: {item.quantity}</span>
                                                )}
                                                {item.orderNumber && (
                                                    <span>Sipariş: {item.orderNumber}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[11px] text-slate-400 shrink-0">
                                            {formatDate(item.createdAt ?? item.updatedAt)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Quick Actions ──────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <QuickActionCard
                        href="/production/planning"
                        icon={<Factory className="w-5 h-5 text-lightning-blue" />}
                        title="Yeni Üretim Emri"
                        description="Üretim planlama ekranına git ve yeni bir üretim emri oluştur."
                    />
                    <QuickActionCard
                        href="/production/recipes"
                        icon={<BookOpen className="w-5 h-5 text-emerald-600" />}
                        title="Yeni Reçete"
                        description="Ürün reçetelerini görüntüle veya yeni reçete tanımla."
                    />
                    <QuickActionCard
                        href="/inventory"
                        icon={<Package className="w-5 h-5 text-amber-600" />}
                        title="Stok Yönetimi"
                        description="Envanter durumunu kontrol et, stok giriş-çıkış işlemleri yap."
                    />
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  KPI Card                                                           */
/* ------------------------------------------------------------------ */

const ACCENT_MAP: Record<string, { iconBg: string; iconText: string }> = {
    blue: { iconBg: 'bg-blue-50', iconText: 'text-lightning-blue' },
    teal: { iconBg: 'bg-teal-50', iconText: 'text-teal-600' },
    emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
    amber: { iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
};

function KpiCard({
    label,
    value,
    icon,
    accentColor,
    loading,
    error,
}: {
    label: string;
    value?: number | string;
    icon: React.ReactNode;
    accentColor: string;
    loading: boolean;
    error: boolean;
}) {
    const accent = ACCENT_MAP[accentColor] ?? ACCENT_MAP.blue;

    return (
        <div className="bg-white p-5 border border-lightning-border rounded shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    {label}
                </span>
                <div className={`p-1.5 rounded ${accent.iconBg} ${accent.iconText}`}>
                    {icon}
                </div>
            </div>

            {loading ? (
                <Skeleton className="h-9 w-20" />
            ) : error ? (
                <span className="text-2xl font-black text-slate-300">--</span>
            ) : (
                <h3 className="text-3xl font-black text-slate-800">
                    {value ?? 0}
                </h3>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Quick Action Card                                                  */
/* ------------------------------------------------------------------ */

function QuickActionCard({
    href,
    icon,
    title,
    description,
}: {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group bg-white border border-lightning-border rounded shadow-sm p-5 flex items-start gap-4 hover:shadow transition-shadow hover:border-lightning-blue/30"
        >
            <div className="p-2 bg-slate-50 rounded group-hover:bg-blue-50 transition-colors shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-lightning-blue transition-colors">
                    {title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {description}
                </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-lightning-blue transition-colors mt-1 shrink-0" />
        </Link>
    );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(raw: string | undefined): string {
    if (!raw) return '';
    try {
        const date = new Date(raw);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);

        if (diffMin < 1) return 'Az önce';
        if (diffMin < 60) return `${diffMin} dk önce`;

        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) return `${diffHrs} saat önce`;

        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return `${diffDays} gün önce`;

        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return '';
    }
}
