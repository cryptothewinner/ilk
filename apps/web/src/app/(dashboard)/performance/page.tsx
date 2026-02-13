'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Database, RotateCcw } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { clearClientApiMetrics, getClientApiSummary } from '@/lib/performance-metrics';
import { Button } from '@/components/ui/button';

type BackendSummary = {
    windowMinutes: number;
    totals: {
        requestCount: number;
        prismaQueryCount: number;
    };
    endpoints: Array<{
        method: string;
        route: string;
        count: number;
        avgMs: number;
        p95Ms: number;
        p99Ms: number;
        errorRate: number;
    }>;
    prisma: Array<{
        operation: string;
        count: number;
        avgMs: number;
        p95Ms: number;
        p99Ms: number;
    }>;
};

export default function PerformanceBaselinePage() {
    const [refreshKey, setRefreshKey] = useState(0);

    const { data, refetch, isFetching } = useQuery({
        queryKey: ['performance-summary', refreshKey],
        queryFn: () => apiClient.get<any>('/performance/summary'),
        staleTime: 0,
    });

    const backendSummary: BackendSummary | null = data?.data ?? data ?? null;
    const clientSummary = useMemo(() => getClientApiSummary(), [refreshKey, data]);

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
            <header className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gözlem</p>
                    <h1 className="text-2xl font-bold text-slate-800">Performans Baseline</h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            clearClientApiMetrics();
                            setRefreshKey((v) => v + 1);
                        }}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Client Verisini Sıfırla
                    </Button>
                    <Button onClick={() => refetch()} disabled={isFetching}>
                        <Activity className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                        Yenile
                    </Button>
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard label="Backend İstek" value={backendSummary?.totals.requestCount ?? 0} />
                <MetricCard label="Prisma Sorgu" value={backendSummary?.totals.prismaQueryCount ?? 0} />
            </section>

            <section className="bg-white border rounded p-4 shadow-sm">
                <h2 className="font-semibold mb-3 text-slate-800">Frontend API Özeti (Son 15 dk)</h2>
                <SimpleTable
                    columns={['Method', 'Endpoint', 'Count', 'Avg', 'P95', 'P99', 'Error']}
                    rows={clientSummary.endpoints.slice(0, 10).map((item) => [
                        item.method,
                        item.endpoint,
                        String(item.count),
                        `${item.avgMs} ms`,
                        `${item.p95Ms} ms`,
                        `${item.p99Ms} ms`,
                        `%${(item.errorRate * 100).toFixed(2)}`,
                    ])}
                />
            </section>

            <section className="bg-white border rounded p-4 shadow-sm">
                <h2 className="font-semibold mb-3 text-slate-800">Backend Endpoint Özeti (Son 15 dk)</h2>
                <SimpleTable
                    columns={['Method', 'Route', 'Count', 'Avg', 'P95', 'P99', 'Error']}
                    rows={(backendSummary?.endpoints ?? []).slice(0, 10).map((item) => [
                        item.method,
                        item.route,
                        String(item.count),
                        `${item.avgMs} ms`,
                        `${item.p95Ms} ms`,
                        `${item.p99Ms} ms`,
                        `%${(item.errorRate * 100).toFixed(2)}`,
                    ])}
                />
            </section>

            <section className="bg-white border rounded p-4 shadow-sm">
                <h2 className="font-semibold mb-3 text-slate-800 flex items-center gap-2">
                    <Database className="w-4 h-4" /> Prisma Operasyonları
                </h2>
                <SimpleTable
                    columns={['Operation', 'Count', 'Avg', 'P95', 'P99']}
                    rows={(backendSummary?.prisma ?? []).slice(0, 10).map((item) => [
                        item.operation,
                        String(item.count),
                        `${item.avgMs} ms`,
                        `${item.p95Ms} ms`,
                        `${item.p99Ms} ms`,
                    ])}
                />
            </section>
        </div>
    );
}

function MetricCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white border rounded p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
    );
}

function SimpleTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
    return (
        <div className="overflow-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left border-b border-slate-100">
                        {columns.map((column) => (
                            <th key={column} className="py-2 pr-3 font-semibold text-slate-600">{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td className="py-4 text-slate-400 italic" colSpan={columns.length}>Henüz veri yok.</td>
                        </tr>
                    ) : rows.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                            {row.map((cell, cellIdx) => (
                                <td key={`${idx}-${cellIdx}`} className="py-2 pr-3 text-slate-700">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
