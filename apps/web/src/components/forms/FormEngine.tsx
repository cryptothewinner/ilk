'use client';

import React, { useMemo } from 'react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEntitySchema } from '@/hooks/use-metadata';
import { generateZodSchema, extractDefaultValues } from '@/lib/schema-generator';
import {
    TextField,
    NumberField,
    SelectField,
    BooleanField
} from '../form-engine/fields';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X, AlertCircle } from 'lucide-react';
import {
    FieldMetadata,
    FieldGroup as SharedFieldGroup
} from '@sepenatural/shared';

interface FormEngineProps {
    entitySlug: string;
    initialData?: Record<string, any>;
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
}

export function FormEngine({
    entitySlug,
    initialData = {},
    onSubmit,
    onCancel,
    isLoading: externalLoading
}: FormEngineProps) {
    const { data: schemaResult, isLoading: schemaLoading, error: schemaError } = useEntitySchema(entitySlug);
    const schema = schemaResult?.data;

    const zodSchema = useMemo(() => {
        if (!schema) return null;
        return generateZodSchema(schema);
    }, [schema]);

    const defaultValues = useMemo(() => {
        if (!schema) return {};
        const extracted = extractDefaultValues(schema);
        return { ...extracted, ...initialData };
    }, [schema, initialData]);

    const form = useForm({
        resolver: zodSchema ? zodResolver(zodSchema) : undefined,
        defaultValues,
        values: defaultValues, // Keep in sync
    });

    const { handleSubmit, formState: { isSubmitting, isDirty } } = form;

    if (schemaLoading || externalLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Form yapılandırılıyor...</p>
            </div>
        );
    }

    if (schemaError || !schemaResult?.success) {
        return (
            <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-lg flex flex-col items-center text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-destructive" />
                <h3 className="font-semibold text-lg">Şema Yüklenemedi</h3>
                <p className="text-sm text-muted-foreground">{schemaError?.message || 'Bir hata oluştu'}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Tekrar Dene</Button>
            </div>
        );
    }

    if (!schema) return null;

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-primary">{schema.displayName}</h2>
                        {schema.description && <p className="text-sm text-muted-foreground">{schema.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {onCancel && (
                            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                                <X className="w-4 h-4 mr-2" /> Vazgeç
                            </Button>
                        )}
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-white shadow-lg transition-all active:scale-95"
                            disabled={isSubmitting || !isDirty}
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                    </div>
                </div>

                {/* Form Groups */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {schema.groups?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((group) => (
                        <FormGroup key={group.key} group={group} fields={schema.fields.filter(f => f.group === group.key)} />
                    ))}

                    {/* Ungrouped Fields */}
                    {schema.fields.some(f => !f.group) && (
                        <FormGroup
                            group={{ key: 'other', label: 'Diğer Bilgiler' }}
                            fields={schema.fields.filter(f => !f.group)}
                        />
                    )}
                </div>
            </form>
        </Form>
    );
}

function FormGroup({ group, fields }: { group: Partial<SharedFieldGroup>, fields: FieldMetadata[] }) {
    if (fields.length === 0) return null;

    return (
        <div className="space-y-4 border rounded-xl p-6 bg-card shadow-sm">
            <div className="border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold text-primary/80">{group.label}</h3>
                {group.description && <p className="text-xs text-muted-foreground">{group.description}</p>}
            </div>

            <div className="grid grid-cols-1 gap-5">
                {fields.sort((a, b) => (a.order || 0) - (b.order || 0)).map((field) => (
                    <FieldRenderer key={field.key} field={field} />
                ))}
            </div>
        </div>
    );
}

function FieldRenderer({ field }: { field: FieldMetadata }) {
    if (!field.visible) return null;

    switch (field.type) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'url':
        case 'phone':
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
        default:
            return (
                <div className="p-2 border border-amber-200 bg-amber-50 rounded text-xs text-amber-700">
                    Bilinmeyen alan tipi: {field.type} ({field.label})
                </div>
            );
    }
}
