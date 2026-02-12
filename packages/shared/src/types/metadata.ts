export type FieldType =
    | 'text'
    | 'number'
    | 'decimal'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'select'
    | 'multiselect'
    | 'textarea'
    | 'email'
    | 'url'
    | 'phone'
    | 'currency'
    | 'percentage'
    | 'readonly';

export interface FieldOption {
    label: string;
    value: string;
}

export interface FieldValidation {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;
    custom?: string; // Reserved for future custom validators
}

export interface FieldMetadata {
    key: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    defaultValue?: unknown;
    helpText?: string;
    validation?: FieldValidation;
    options?: FieldOption[];        // For select/multiselect
    group?: string;                 // Tab or section grouping
    order?: number;                 // Display order
    colSpan?: 1 | 2 | 3 | 4;      // Grid column span
    visible?: boolean;              // Whether to render at all
    disabled?: boolean;             // Read-only field
    dependsOn?: {                   // Conditional visibility
        field: string;
        value: unknown;
        operator?: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'contains';
    };
    prefix?: string;               // e.g., "₺" for currency
    suffix?: string;               // e.g., "%" for percentage
}

export interface FieldGroup {
    key: string;
    label: string;
    description?: string;
    order?: number;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
}

export interface EntityFormSchema {
    entitySlug: string;
    displayName: string;
    description?: string;
    groups?: FieldGroup[];
    fields: FieldMetadata[];
    layout?: {
        columns?: 1 | 2 | 3 | 4;
        labelPosition?: 'top' | 'left';
    };
    version?: number;
}

export interface EntityFormSchemaResponse {
    success: boolean;
    data: EntityFormSchema;
    generatedAt: string;
}
