import { z, ZodTypeAny } from 'zod';
import type { FieldMetadata, EntityFormSchema } from '@sepenatural/shared';

/**
 * Dynamically generates a Zod schema from EntityFormSchema metadata.
 * This is the core of the metadata-driven approach — NO hardcoded validation.
 */
export function generateZodSchema(formSchema: EntityFormSchema): z.ZodObject<any> {
    const shape: Record<string, ZodTypeAny> = {};

    for (const field of formSchema.fields) {
        if (field.visible === false) continue;
        shape[field.key] = buildFieldSchema(field);
    }

    return z.object(shape);
}

function buildFieldSchema(field: FieldMetadata): ZodTypeAny {
    const v = field.validation ?? {};
    let schema: ZodTypeAny;

    switch (field.type) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'url':
        case 'phone':
            schema = buildStringSchema(field, v);
            break;

        case 'number':
            schema = buildNumberSchema(v);
            break;

        case 'decimal':
        case 'currency':
        case 'percentage':
            schema = buildDecimalSchema(v);
            break;

        case 'boolean':
            schema = z.boolean();
            break;

        case 'date':
        case 'datetime':
            schema = z.string(); // ISO string from date pickers
            if (!v.required) {
                schema = schema.optional().or(z.literal(''));
            }
            break;

        case 'select':
            schema = buildSelectSchema(field, v);
            break;

        case 'multiselect':
            schema = z.array(z.string());
            if (v.min) schema = (schema as z.ZodArray<any>).min(v.min, `En az ${v.min} seçim yapılmalı`);
            if (!v.required) schema = schema.optional();
            break;

        default:
            schema = z.any();
    }

    return schema;
}

function buildStringSchema(field: FieldMetadata, v: NonNullable<FieldMetadata['validation']>): ZodTypeAny {
    let schema = z.string();

    if (v.minLength) {
        schema = schema.min(v.minLength, `En az ${v.minLength} karakter olmalı`);
    }
    if (v.maxLength) {
        schema = schema.max(v.maxLength, `En fazla ${v.maxLength} karakter olmalı`);
    }
    if (v.pattern) {
        schema = schema.regex(new RegExp(v.pattern), v.patternMessage || 'Geçersiz format');
    }

    if (field.type === 'email') {
        schema = schema.email('Geçerli bir e-posta adresi giriniz');
    }
    if (field.type === 'url') {
        schema = schema.url('Geçerli bir URL giriniz');
    }

    if (!v.required) {
        return schema.optional().or(z.literal(''));
    }

    return schema.min(1, `${field.label} zorunludur`);
}

function buildNumberSchema(v: NonNullable<FieldMetadata['validation']>): ZodTypeAny {
    // Accept string from input, coerce to number
    let schema = z.coerce.number({
        invalid_type_error: 'Geçerli bir sayı giriniz',
    });

    if (v.min !== undefined) {
        schema = schema.min(v.min, `Minimum değer: ${v.min}`);
    }
    if (v.max !== undefined) {
        schema = schema.max(v.max, `Maksimum değer: ${v.max}`);
    }

    if (!v.required) {
        return schema.optional().or(z.literal('').transform(() => undefined) as any);
    }

    return schema;
}

function buildDecimalSchema(v: NonNullable<FieldMetadata['validation']>): ZodTypeAny {
    let schema = z.coerce.number({
        invalid_type_error: 'Geçerli bir sayı giriniz',
    });

    if (v.min !== undefined) {
        schema = schema.min(v.min, `Minimum değer: ${v.min}`);
    }
    if (v.max !== undefined) {
        schema = schema.max(v.max, `Maksimum değer: ${v.max}`);
    }

    if (!v.required) {
        return schema.optional().or(z.literal('').transform(() => undefined) as any);
    }

    return schema;
}

function buildSelectSchema(field: FieldMetadata, v: NonNullable<FieldMetadata['validation']>): ZodTypeAny {
    if (field.options && field.options.length > 0) {
        const values = field.options.map((o) => o.value) as [string, ...string[]];
        let schema = z.enum(values, {
            errorMap: () => ({ message: `${field.label} için geçerli bir seçim yapınız` }),
        });

        if (!v.required) {
            return schema.optional().or(z.literal(''));
        }

        return schema;
    }

    // Fallback to string if no options defined
    let schema = z.string();
    if (!v.required) {
        return schema.optional().or(z.literal(''));
    }
    return schema.min(1, `${field.label} zorunludur`);
}

/**
 * Extracts default values from the schema for initializing the form.
 */
export function extractDefaultValues(formSchema: EntityFormSchema): Record<string, any> {
    const defaults: Record<string, any> = {};

    for (const field of formSchema.fields) {
        if (field.visible === false) continue;

        if (field.defaultValue !== undefined && field.defaultValue !== null) {
            defaults[field.key] = field.defaultValue;
        } else {
            // Type-appropriate empty defaults
            switch (field.type) {
                case 'boolean':
                    defaults[field.key] = false;
                    break;
                case 'number':
                case 'decimal':
                case 'currency':
                case 'percentage':
                    defaults[field.key] = 0;
                    break;
                case 'multiselect':
                    defaults[field.key] = [];
                    break;
                default:
                    defaults[field.key] = '';
            }
        }
    }

    return defaults;
}
