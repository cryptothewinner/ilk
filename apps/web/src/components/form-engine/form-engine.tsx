'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useEntitySchema } from '@/hooks/use-metadata';
import { generateZodSchema, extractDefaultValues } from '@/lib/schema-generator';
import { FieldResolver } from './field-resolver';
import type { EntityFormSchema, FieldMetadata, FieldGroup } from '@sepenatural/shared';
import { cn } from '@/lib/utils';

interface FormEngineProps {
    entitySlug: string;
    /** Existing data to populate the form (edit mode) */
    initialData?: Record<string, any>;
    /** Called on valid form submit */
    onSubmit: (data: Record<string, any>) => void | Promise<void>;
    /** Whether the form is in a submitting state */
    isSubmitting?: boolean;
    /** Read-only mode */
    readOnly?: boolean;
    /** Optional class name */
    className?: string;
    /** Callback for cancel/close */
    onCancel?: () => void;
}

export function FormEngine({
    entitySlug,
    initialData,
    onSubmit,
    isSubmitting = false,
    readOnly = false,
    className,
    onCancel,
}: FormEngineProps) {
    const { data: schemaResponse, isLoading, error } = useEntitySchema(entitySlug);
    const formSchema = schemaResponse?.data;

    // Generate Zod schema from metadata
    const zodSchema = useMemo(() => {
        if (!formSchema) return null;
        return generateZodSchema(formSchema);
    }, [formSchema]);

    // Merge default values with initial data
    const defaultValues = useMemo(() => {
        if (!formSchema) return {};
        const defaults = extractDefaultValues(formSchema);
        return initialData ? { ...defaults, ...initialData } : defaults;
    }, [formSchema, initialData]);

    // Initialize form
    const form = useForm({
        resolver: zodSchema ? zodResolver(zodSchema) : undefined,
        defaultValues,
        mode: 'onBlur',
    });

    // Reset form when initial data changes (e.g., switching between records)
    useEffect(() => {
        if (initialData && formSchema) {
            const defaults = extractDefaultValues(formSchema);
            form.reset({ ...defaults, ...initialData });
        }
    }, [initialData, formSchema, form]);

    const handleSubmit = useCallback(
        async (data: Record<string, any>) => {
            // Strip out undefined and empty string values for cleaner PATCH
            const cleanData: Record<string, any> = {};
            for (const [key, value] of Object.entries(data)) {
                if (value !== undefined && value !== '') {
                    cleanData[key] = value;
                }
            }
            await onSubmit(cleanData);
        },
        [onSubmit],
    );

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground animate-pulse">Form şeması yapılandırılıyor...</span>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
                <p className="text-destructive font-bold text-lg">Form şeması yüklenemedi</p>
                <p className="text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : 'Bilinmeyen hata'}
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Tekrar Dene</Button>
            </div>
        );
    }

    if (!formSchema || !zodSchema) {
        return (
            <div className="text-center p-6 text-muted-foreground italic">
                Form şeması bulunamadı.
            </div>
        );
    }

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className={cn('space-y-8', className)}
            >
                {/* Form Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black tracking-tight text-slate-900">{formSchema.displayName}</h3>
                        {formSchema.description && (
                            <p className="text-sm text-slate-500 mt-1">
                                {formSchema.description}
                            </p>
                        )}
                    </div>
                    <div className="hidden md:block">
                        {/* Optional status badges etc can go here */}
                    </div>
                </div>

                <Separator className="bg-slate-100" />

                {/* Render grouped fields */}
                <FormGroups
                    formSchema={formSchema}
                    readOnly={readOnly}
                />

                {/* Submit Button */}
                {!readOnly && (
                    <div className="flex items-center justify-end gap-3 pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm py-4 border-t mt-8 -mx-8 px-8">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                Vazgeç
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                            disabled={isSubmitting}
                            className="text-slate-600"
                        >
                            Sıfırla
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !form.formState.isDirty}
                            className="bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 px-8 transition-all active:scale-95"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Kaydet
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </FormProvider>
    );
}

/** Renders fields organized into groups with collapsible sections */
function FormGroups({
    formSchema,
    readOnly,
}: {
    formSchema: EntityFormSchema;
    readOnly: boolean;
}) {
    const columns = formSchema.layout?.columns ?? 2;

    // Group fields by their group key
    const groupedFields = useMemo(() => {
        const map = new Map<string, FieldMetadata[]>();

        for (const field of formSchema.fields) {
            if (field.visible === false) continue;
            const groupKey = field.group || '__ungrouped__';
            if (!map.has(groupKey)) map.set(groupKey, []);
            map.get(groupKey)!.push(field);
        }

        return map;
    }, [formSchema.fields]);

    // Sort groups by order
    const sortedGroups = useMemo(() => {
        const groups = formSchema.groups || [];
        const sorted = [...groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        // Add ungrouped at the end if exists
        if (groupedFields.has('__ungrouped__')) {
            sorted.push({
                key: '__ungrouped__',
                label: 'Genel Bilgiler',
                order: 999,
            } as FieldGroup);
        }

        return sorted;
    }, [formSchema.groups, groupedFields]);

    // If no groups defined, render all fields in a single grid
    if (sortedGroups.length === 0) {
        const allFields = formSchema.fields.filter((f) => f.visible !== false);
        return (
            <FieldGrid columns={columns} fields={allFields} readOnly={readOnly} />
        );
    }

    return (
        <div className="space-y-10">
            {sortedGroups.map((group) => {
                const fields = groupedFields.get(group.key);
                if (!fields || fields.length === 0) return null;

                if (group.collapsible) {
                    return (
                        <CollapsibleGroup
                            key={group.key}
                            group={group}
                            fields={fields}
                            columns={columns}
                            readOnly={readOnly}
                        />
                    );
                }

                return (
                    <div key={group.key} className="space-y-6">
                        <GroupHeader group={group} />
                        <FieldGrid columns={columns} fields={fields} readOnly={readOnly} />
                    </div>
                );
            })}
        </div>
    );
}

function CollapsibleGroup({
    group,
    fields,
    columns,
    readOnly,
}: {
    group: FieldGroup;
    fields: FieldMetadata[];
    columns: number;
    readOnly: boolean;
}) {
    return (
        <Collapsible defaultOpen={!group.defaultCollapsed} className="border rounded-2xl p-6 bg-slate-50/30 shadow-sm transition-all hover:shadow-md">
            <div className="space-y-6">
                <CollapsibleTrigger asChild>
                    <button
                        type="button"
                        className="flex items-center gap-3 w-full text-left group outline-none"
                    >
                        <ChevronDown className="h-5 w-5 text-slate-400 transition-transform group-data-[state=closed]:-rotate-90" />
                        <GroupHeader group={group} />
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="animate-in slide-in-from-top-2 duration-300">
                    <Separator className="mb-6 bg-slate-100" />
                    <FieldGrid columns={columns} fields={fields} readOnly={readOnly} />
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}

function GroupHeader({ group }: { group: FieldGroup }) {
    return (
        <div className="flex-1">
            <h4 className="text-lg font-bold text-slate-800">{group.label}</h4>
            {group.description && (
                <p className="text-xs text-slate-500 mt-0.5">{group.description}</p>
            )}
        </div>
    );
}

function FieldGrid({
    columns,
    fields,
    readOnly,
}: {
    columns: number;
    fields: FieldMetadata[];
    readOnly: boolean;
}) {
    const gridClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2 lg:gap-8',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-8',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:gap-6',
    }[columns] || 'grid-cols-1 md:grid-cols-2';

    return (
        <div className={cn('grid gap-6', gridClass)}>
            {fields.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((field) => {
                const colSpanClass = {
                    1: '',
                    2: 'md:col-span-2',
                    3: 'md:col-span-2 lg:col-span-3',
                    4: 'md:col-span-2 lg:col-span-4',
                }[field.colSpan ?? 1] || '';

                return (
                    <div key={field.key} className={cn("transition-all duration-300", colSpanClass)}>
                        <FieldResolver
                            field={readOnly ? { ...field, disabled: true } : field}
                        />
                    </div>
                );
            })}
        </div>
    );
}
