'use client';

import { useFormContext } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
} from '@/components/ui/form';
import type { FieldMetadata } from '@sepenatural/shared';

interface BooleanFieldProps {
    field: FieldMetadata;
}

export function BooleanField({ field }: BooleanFieldProps) {
    const form = useFormContext();

    return (
        <FormField
            control={form.control}
            name={field.key}
            render={({ field: formField }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>{field.label}</FormLabel>
                        {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                    </div>
                    <FormControl>
                        <Switch
                            checked={formField.value}
                            onCheckedChange={formField.onChange}
                            disabled={field.disabled}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );
}
