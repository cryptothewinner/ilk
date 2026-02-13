import { Injectable } from '@nestjs/common';

interface RequestMetric {
    method: string;
    route: string;
    statusCode: number;
    durationMs: number;
    timestamp: number;
}

interface PrismaMetric {
    model: string;
    action: string;
    durationMs: number;
    timestamp: number;
}

@Injectable()
export class PerformanceMetricsService {
    private readonly requestMetrics: RequestMetric[] = [];
    private readonly prismaMetrics: PrismaMetric[] = [];
    private readonly maxItems = 5000;

    recordRequest(metric: RequestMetric) {
        this.requestMetrics.push(metric);
        if (this.requestMetrics.length > this.maxItems) {
            this.requestMetrics.splice(0, this.requestMetrics.length - this.maxItems);
        }
    }

    recordPrisma(metric: PrismaMetric) {
        this.prismaMetrics.push(metric);
        if (this.prismaMetrics.length > this.maxItems) {
            this.prismaMetrics.splice(0, this.prismaMetrics.length - this.maxItems);
        }
    }

    getSummary() {
        const now = Date.now();
        const last15m = now - 15 * 60 * 1000;

        const requestWindow = this.requestMetrics.filter((item) => item.timestamp >= last15m);
        const prismaWindow = this.prismaMetrics.filter((item) => item.timestamp >= last15m);

        const endpointSummary = this.aggregateRequests(requestWindow);
        const prismaSummary = this.aggregatePrisma(prismaWindow);

        return {
            windowMinutes: 15,
            totals: {
                requestCount: requestWindow.length,
                prismaQueryCount: prismaWindow.length,
            },
            endpoints: endpointSummary,
            prisma: prismaSummary,
            generatedAt: new Date().toISOString(),
        };
    }

    private aggregateRequests(metrics: RequestMetric[]) {
        const grouped = new Map<string, RequestMetric[]>();

        for (const metric of metrics) {
            const key = `${metric.method} ${metric.route}`;
            const bucket = grouped.get(key) ?? [];
            bucket.push(metric);
            grouped.set(key, bucket);
        }

        return Array.from(grouped.entries())
            .map(([key, items]) => {
                const durations = items.map((item) => item.durationMs).sort((a, b) => a - b);
                const errorCount = items.filter((item) => item.statusCode >= 400).length;
                const avg = durations.reduce((sum, value) => sum + value, 0) / durations.length;

                const [method, ...routeParts] = key.split(' ');
                return {
                    method,
                    route: routeParts.join(' '),
                    count: items.length,
                    avgMs: Number(avg.toFixed(2)),
                    p95Ms: this.percentile(durations, 95),
                    p99Ms: this.percentile(durations, 99),
                    errorRate: Number((errorCount / items.length).toFixed(4)),
                };
            })
            .sort((a, b) => b.p95Ms - a.p95Ms);
    }

    private aggregatePrisma(metrics: PrismaMetric[]) {
        const grouped = new Map<string, PrismaMetric[]>();

        for (const metric of metrics) {
            const key = `${metric.model}.${metric.action}`;
            const bucket = grouped.get(key) ?? [];
            bucket.push(metric);
            grouped.set(key, bucket);
        }

        return Array.from(grouped.entries())
            .map(([key, items]) => {
                const durations = items.map((item) => item.durationMs).sort((a, b) => a - b);
                const avg = durations.reduce((sum, value) => sum + value, 0) / durations.length;

                return {
                    operation: key,
                    count: items.length,
                    avgMs: Number(avg.toFixed(2)),
                    p95Ms: this.percentile(durations, 95),
                    p99Ms: this.percentile(durations, 99),
                };
            })
            .sort((a, b) => b.p95Ms - a.p95Ms);
    }

    private percentile(values: number[], percentile: number): number {
        if (values.length === 0) return 0;
        const index = Math.ceil((percentile / 100) * values.length) - 1;
        return Number(values[Math.max(0, index)].toFixed(2));
    }
}
