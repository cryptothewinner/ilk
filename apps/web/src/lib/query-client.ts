import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api-client';

function shouldRetryRequest(failureCount: number, error: unknown) {
    if (failureCount >= 1) {
        return false;
    }

    if (error instanceof TypeError) {
        return false;
    }

    if (error instanceof ApiError) {
        if (error.status >= 400 && error.status < 500) {
            return false;
        }

        return error.status >= 500;
    }

    return true;
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000,
            retry: shouldRetryRequest,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        },
    },
});
