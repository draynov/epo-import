/**
 * Zod схеми за валидация на портфолио конфигурацията
 */

import { z } from "zod";

/**
 * Field type enum
 */
export const FieldTypeSchema = z.enum([
  "text",
  "textarea",
  "number",
  "date",
  "boolean",
  "select",
  "multiselect",
  "checkbox",
  "month_year",
]);

/**
 * Field option schema
 */
export const FieldOptionSchema = z.object({
  value: z.union([z.string(), z.number()]),
  label: z.string(),
});

/**
 * Portfolio field definition schema
 */
export const PortfolioFieldDefinitionSchema = z.object({
  key: z.string().min(1, "Field key cannot be empty"),
  label: z.string().min(1, "Field label cannot be empty"),
  type: FieldTypeSchema,
  required: z.boolean(),
  description: z.string().optional(),
  options: z.array(FieldOptionSchema).optional(),
  placeholder: z.string().optional(),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  conditionalOn: z
    .object({
      field: z.string(),
      value: z.union([z.string(), z.number()]),
    })
    .optional(),
});

/**
 * Base subsection schema
 */
const BaseSubsectionSchema = z.object({
  subsectionId: z.string().min(1, "Subsection ID cannot be empty"),
  sectionId: z.string().min(1, "Section ID cannot be empty"),
  title: z.string().min(1, "Title cannot be empty"),
  description: z.string(),
  order: z.number().int().positive(),
  fields: z
    .array(PortfolioFieldDefinitionSchema)
    .min(1, "Subsection must have at least one field"),
  endpoint: z.object({
    cmd: z.string().min(1, "Endpoint cmd cannot be empty"),
    method: z.literal("POST"),
  }),
});

/**
 * Direct fields subsection schema
 */
export const DirectFieldsSubsectionSchema = BaseSubsectionSchema.extend({
  type: z.literal("direct_fields"),
});

/**
 * Record list subsection schema
 */
export const RecordListSubsectionSchema = BaseSubsectionSchema.extend({
  type: z.literal("record_list"),
  displayMode: z.enum(["table", "list"]),
  allowMultipleRecords: z.literal(true),
});

/**
 * Subsection definition schema (discriminated union)
 */
export const PortfolioSubsectionDefinitionSchema = z.discriminatedUnion(
  "type",
  [DirectFieldsSubsectionSchema, RecordListSubsectionSchema]
);

/**
 * Section definition schema
 */
export const PortfolioSectionDefinitionSchema = z.object({
  sectionId: z.string().min(1, "Section ID cannot be empty"),
  title: z.string().min(1, "Section title cannot be empty"),
  description: z.string(),
  order: z.number().int().positive(),
  subsections: z
    .array(PortfolioSubsectionDefinitionSchema)
    .min(1, "Section must have at least one subsection"),
});

/**
 * Full portfolio configuration schema
 */
export const PortfolioConfigurationSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Invalid version format"),
  sections: z
    .array(PortfolioSectionDefinitionSchema)
    .length(6, "Portfolio must have exactly 6 sections"),
});

/**
 * Валидация на пълна конфигурация
 */
export function validatePortfolioConfiguration(config: unknown) {
  const result = PortfolioConfigurationSchema.safeParse(config);

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    };
  }

  // Допълнителни бизнес валидации
  const additionalErrors: Array<{ path: string; message: string }> = [];

  // Проверка за уникалност на section IDs
  const sectionIds = new Set<string>();
  for (const section of result.data.sections) {
    if (sectionIds.has(section.sectionId)) {
      additionalErrors.push({
        path: `sections[${section.sectionId}]`,
        message: `Duplicate section ID: ${section.sectionId}`,
      });
    }
    sectionIds.add(section.sectionId);
  }

  // Проверка за уникалност на subsection IDs
  const subsectionIds = new Set<string>();
  for (const section of result.data.sections) {
    for (const subsection of section.subsections) {
      if (subsectionIds.has(subsection.subsectionId)) {
        additionalErrors.push({
          path: `subsections[${subsection.subsectionId}]`,
          message: `Duplicate subsection ID: ${subsection.subsectionId}`,
        });
      }
      subsectionIds.add(subsection.subsectionId);

      // Проверка дали subsection принадлежи към правилната секция
      if (subsection.sectionId !== section.sectionId) {
        additionalErrors.push({
          path: `subsections[${subsection.subsectionId}]`,
          message: `Subsection ${subsection.subsectionId} has sectionId ${subsection.sectionId} but is placed in section ${section.sectionId}`,
        });
      }

      // Проверка за уникалност на field keys в рамките на подсекцията
      const fieldKeys = new Set<string>();
      for (const field of subsection.fields) {
        if (fieldKeys.has(field.key)) {
          additionalErrors.push({
            path: `subsections[${subsection.subsectionId}].fields[${field.key}]`,
            message: `Duplicate field key: ${field.key}`,
          });
        }
        fieldKeys.add(field.key);
      }
    }
  }

  if (additionalErrors.length > 0) {
    return {
      valid: false,
      errors: additionalErrors,
    };
  }

  return {
    valid: true,
    data: result.data,
    errors: [],
  };
}
