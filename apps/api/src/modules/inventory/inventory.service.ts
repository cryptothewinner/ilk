import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type {
    StockPagedResponse,
    StockItemDto,
    ServerSideGridRequest,
    ServerSideGridResponse,
} from '@sepenatural/shared';

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name);

    constructor(private httpService: HttpService) { }

    /**
     * Fetch stock data from .NET Integration Bridge.
     * Translates AG Grid's Server-Side Row Model request into bridge-compatible params.
     */
    async getStocksForGrid(
        gridRequest: ServerSideGridRequest,
    ): Promise<ServerSideGridResponse<StockItemDto>> {
        try {
            const page = Math.floor(gridRequest.startRow / (gridRequest.endRow - gridRequest.startRow)) + 1;
            const limit = gridRequest.endRow - gridRequest.startRow;

            // Map AG Grid sort model
            const sortField = gridRequest.sortModel?.[0]?.colId;
            const sortDirection = gridRequest.sortModel?.[0]?.sort || 'asc';

            // Map AG Grid filter model to simple text search
            let filterText = gridRequest.searchText || '';
            if (gridRequest.filterModel) {
                const textFilters = Object.entries(gridRequest.filterModel)
                    .filter(([_, val]: [string, any]) => val.filterType === 'text' && val.filter)
                    .map(([_, val]: [string, any]) => val.filter);
                if (textFilters.length > 0 && !filterText) {
                    filterText = String(textFilters[0]);
                }
            }

            // Build query params for .NET bridge
            const params: Record<string, any> = {
                page,
                limit,
                sortField,
                sortDirection,
            };

            if (filterText) params.filter = filterText;

            // Handle set filters (e.g., warehouseCode, isActive)
            if (gridRequest.filterModel?.warehouseCode?.values) {
                // For set filters, pass first value (simplification)
                const values = gridRequest.filterModel.warehouseCode.values;
                if (values.length === 1) {
                    params.warehouseCode = values[0];
                }
            }

            if (gridRequest.filterModel?.isActive) {
                const filter = gridRequest.filterModel.isActive;
                if (filter.values && filter.values.length === 1) {
                    params.isActive = filter.values[0] === 'true';
                }
            }

            this.logger.debug(`Calling bridge: GET /api/netsis/stock with params: ${JSON.stringify(params)}`);

            const response = await firstValueFrom(
                this.httpService.get<StockPagedResponse>('/api/netsis/stock', { params }),
            );

            const data = response.data;

            return {
                rows: data.rows,
                lastRow: data.totalCount,
                totalCount: data.totalCount,
            };
        } catch (error: any) {
            this.logger.error(`Bridge call failed: ${error.message}`, error.stack);

            if (error.code === 'ECONNREFUSED') {
                throw new HttpException(
                    'Integration bridge is not available. Start the .NET service on port 5295.',
                    HttpStatus.SERVICE_UNAVAILABLE,
                );
            }

            throw new HttpException(
                'Failed to fetch inventory data from bridge',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Get a single stock item by SKU.
     */
    async getStockBySku(sku: string): Promise<StockItemDto> {
        try {
            const response = await firstValueFrom(
                this.httpService.get<StockItemDto>(`/api/netsis/stock/${sku}`),
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new HttpException(`Stock item '${sku}' not found`, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                'Failed to fetch stock item from bridge',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Health check: Verify bridge connectivity.
     */
    async checkBridgeHealth(): Promise<{ status: string; provider: string }> {
        try {
            const response = await firstValueFrom(
                this.httpService.get('/health'), // Bridge health endpoint
            );
            return response.data;
        } catch {
            return { status: 'unavailable', provider: 'unknown' };
        }
    }
}
