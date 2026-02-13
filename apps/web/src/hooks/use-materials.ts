import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface ListParams {
    page: number;
    pageSize: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, any>;
}

interface MaterialListResponse {
    success: boolean;
    data: any[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

interface MaterialDetailResponse {
    success: boolean;
    data: Record<string, any>;
}

export function useMaterialList(params: ListParams) {
    const sp = new URLSearchParams();
    sp.set('page', String(params.page));
    sp.set('pageSize', String(params.pageSize));
    if (params.sortField) sp.set('sortField', params.sortField);
    if (params.sortOrder) sp.set('sortOrder', params.sortOrder);
    if (params.search) sp.set('search', params.search);
    if (params.filters && Object.keys(params.filters).length > 0) {
        sp.set('filters', JSON.stringify(params.filters));
    }
    return useQuery({
        queryKey: ['materials', 'list', params],
        queryFn: () => apiClient.get<MaterialListResponse>(`/materials?${sp.toString()}`),
        staleTime: 30 * 1000,
    });
}

export function useMaterialDetail(id: string | null) {
    return useQuery({
        queryKey: ['materials', 'detail', id],
        queryFn: () => apiClient.get<MaterialDetailResponse>(`/materials/${id}`),
        enabled: !!id,
    });
}

export function useUpdateMaterial() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
            apiClient.patch<MaterialDetailResponse>(`/materials/${id}`, data),
        onSuccess: (_, v) => {
            qc.invalidateQueries({ queryKey: ['materials', 'detail', v.id] });
            qc.invalidateQueries({ queryKey: ['materials', 'list'] });
        },
    });
}
