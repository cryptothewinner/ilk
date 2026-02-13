export interface ClientApiMetric {
    endpoint: string;
    method: string;
    durationMs: number;
    statusCode: number;
    ok: boolean;
    timestamp: number;
}

const STORAGE_KEY = 'sepe_perf_api_metrics';
const MAX_ITEMS = 300;

let memoryMetrics: ClientApiMetric[] = [];

function isBrowser() {
    return typeof window !== 'undefined';
}

function loadFromStorage() {
    if (!isBrowser()) return;
    if (memoryMetrics.length > 0) return;

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as ClientApiMetric[];
        if (Array.isArray(parsed)) {
            memoryMetrics = parsed;
        }
    } catch {
        memoryMetrics = [];
    }
}

function saveToStorage() {
    if (!isBrowser()) return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryMetrics));
    } catch {
        // ignore storage failures
    }
}

export function recordClientApiMetric(metric: ClientApiMetric) {
    loadFromStorage();
    memoryMetrics.push(metric);

    if (memoryMetrics.length > MAX_ITEMS) {
        memoryMetrics = memoryMetrics.slice(memoryMetrics.length - MAX_ITEMS);
    }

    saveToStorage();
}

export function getClientApiSummary() {
    loadFromStorage();
    const last15m = Date.now() - 15 * 60 * 1000;
    const windowed = memoryMetrics.filter((item) => item.timestamp >= last15m);
    const grouped = new Map<string, ClientApiMetric[]>();

    for (const metric of windowed) {
        const key = `${metric.method} ${metric.endpoint}`;
        const bucket = grouped.get(key) ?? [];
        bucket.push(metric);
        grouped.set(key, bucket);
    }

    const endpoints = Array.from(grouped.entries())
        .map(([key, items]) => {
            const durations = items.map((item) => item.durationMs).sort((a, b) => a - b);
            const avg = durations.reduce((sum, value) => sum + value, 0) / durations.length;
            const failed = items.filter((item) => !item.ok).length;
            const [method, ...endpointParts] = key.split(' ');

            return {
                method,
                endpoint: endpointParts.join(' '),
                count: items.length,
                avgMs: Number(avg.toFixed(2)),
                p95Ms: percentile(durations, 95),
                p99Ms: percentile(durations, 99),
                errorRate: Number((failed / items.length).toFixed(4)),
            };
        })
        .sort((a, b) => b.p95Ms - a.p95Ms);

    return {
        windowMinutes: 15,
        totalCalls: windowed.length,
        endpoints,
        generatedAt: new Date().toISOString(),
    };
}

export function clearClientApiMetrics() {
    memoryMetrics = [];
    if (isBrowser()) {
        window.localStorage.removeItem(STORAGE_KEY);
    }
}

function percentile(values: number[], p: number) {
    if (values.length === 0) return 0;
    const index = Math.ceil((p / 100) * values.length) - 1;
    return Number(values[Math.max(0, index)].toFixed(2));
}
