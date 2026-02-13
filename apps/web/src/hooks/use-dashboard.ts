import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const DASHBOARD_STALE_TIME = 60 * 1000;

export function useDashboardKpis() {
    return useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: () => apiClient.get<any>('/dashboard/kpis'),
        staleTime: DASHBOARD_STALE_TIME,
        retry: false,
    });
}

export function useProductionStatus() {
    return useQuery({
        queryKey: ['dashboard', 'production-status'],
        queryFn: () => apiClient.get<any>('/dashboard/production-status'),
        staleTime: DASHBOARD_STALE_TIME,
        retry: false,
    });
}

export function useRecentActivity() {
    return useQuery({
        queryKey: ['dashboard', 'recent-activity'],
        queryFn: () => apiClient.get<any>('/dashboard/recent-activity'),
        staleTime: 30 * 1000,
        retry: false,
    });
}
