'use client';

import React from 'react';
import type { FieldMetadata } from '@sepenatural/shared';
import {
    TextField,
    NumberField,
    SelectField,
    BooleanField
} from './fields';

interface FieldResolverProps {
    field: FieldMetadata;
}

/**
 * Technical component that maps FieldMetadata types to the correct UI component.
 */
export function FieldResolver({ field }: FieldResolverProps) {
    if (field.visible === false) return null;

    switch (field.type) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'url':
        case 'phone':
        case 'readonly':
            return <TextField field={field} />;

        case 'number':
        case 'decimal':
        case 'currency':
        case 'percentage':
            return <NumberField field={field} />;

        case 'select':
            return <SelectField field={field} />;

        case 'boolean':
            return <BooleanField field={field} />;

        case 'multiselect':
            // Placeholder for multiselect if not yet implemented
            return (
                <div className="p-2 border border-amber-200 bg-amber-50 rounded text-xs text-amber-700">
                    Multiselect yakında eklenecek ({field.label})
                </div>
            );

        default:
            return (
                <div className="p-2 border border-destructive/20 bg-destructive/5 rounded text-xs text-destructive">
                    Bilinmeyen alan tipi: {field.type} ({field.label})
                </div>
            );
    }
}
