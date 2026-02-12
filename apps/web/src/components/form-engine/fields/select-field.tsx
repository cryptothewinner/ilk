'use client';

import { useFormContext } from 'react-hook-form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from '@/components/ui/form';
import type { FieldMetadata } from '@sepenatural/shared';

interface SelectFieldProps {
    field: FieldMetadata;
}

export function SelectField({ field }: SelectFieldProps) {
    const form = useFormContext();

    return (
        <FormField
            control={form.control}
            name={field.key}
            render={({ field: formField }) => (
                <FormItem>
                    <FormLabel>
                        {field.label}
                        {field.validation?.required && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <Select
                        onValueChange={formField.onChange}
                        value={formField.value?.toString() || ''}
                        disabled={field.disabled}
                    >
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={field.placeholder || `${field.label} seçiniz`} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {field.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
