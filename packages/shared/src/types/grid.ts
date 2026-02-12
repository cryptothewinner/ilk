// Server-Side Row Model Request/Response Types for AG Grid
export interface ServerSideRequest {
    startRow: number;
    endRow: number;
    sortModel: SortModel[];
    filterModel: Record<string, FilterModel>;
    groupKeys: string[];
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    pivotMode: boolean;
    searchText?: string; // Added for legacy compatibility
}

// Aliases for compatibility
export type ServerSideGridRequest = ServerSideRequest;

export interface SortModel {
    colId: string;
    sort: 'asc' | 'desc';
}

export interface FilterModel {
    filterType: 'text' | 'number' | 'date' | 'set';
    type?: string;
    filter?: string | number;
    filterTo?: string | number;
    values?: string[];
    dateFrom?: string;
    dateTo?: string;
    conditions?: FilterModel[];
    operator?: 'AND' | 'OR';
}

export interface ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc?: string;
}

export interface ServerSideResponse<T = any> {
    rows: T[];
    lastRow: number;
    totalCount: number;
}

// Alias for compatibility
export type ServerSideGridResponse<T = any> = ServerSideResponse<T>;

export interface GridColumnDef {
    field: string;
    headerName: string;
    sortable?: boolean;
    filter?: boolean | string;
    filterParams?: Record<string, any>;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    flex?: number;
    cellRenderer?: string;
    valueFormatter?: string;
    editable?: boolean;
    hide?: boolean;
    pinned?: 'left' | 'right' | null;
    cellClass?: string;
    headerClass?: string;
    type?: string;
}

export interface GridConfig {
    entitySlug: string;
    columns: GridColumnDef[];
    defaultSort?: SortModel[];
    pageSize?: number;
    rowSelection?: 'single' | 'multiple';
    enableExport?: boolean;
}
