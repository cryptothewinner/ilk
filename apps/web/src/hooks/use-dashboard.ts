import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useDashboardKpis() {
    return useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: () => apiClient.get<any>('/dashboard/kpis'),
        staleTime: 60 * 1000,
    });
}

export function useProductionStatus() {
    return useQuery({
        queryKey: ['dashboard', 'production-status'],
        queryFn: () => apiClient.get<any>('/dashboard/production-status'),
        staleTime: 60 * 1000,
    });
}

export function useRecentActivity() {
    return useQuery({
        queryKey: ['dashboard', 'recent-activity'],
        queryFn: () => apiClient.get<any>('/dashboard/recent-activity'),
        staleTime: 30 * 1000,
    });
}
