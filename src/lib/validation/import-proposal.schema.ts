/**
 * Zod схеми за валидация на импорт предложения
 */

import { z } from "zod";

/**
 * Proposal status schema
 */
export const ProposalStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "edited",
]);

/**
 * Field value with source schema
 */
export const FieldValueWithSourceSchema = z.object({
  value: z.unknown(),
  confidence: z.number().min(0).max(1),
  sourceText: z.string(),
  sourcePage: z.number().int().positive().optional(),
});

/**
 * Direct fields import proposal schema
 */
export const DirectFieldsImportProposalSchema = z.object({
  proposalId: z.string().min(1),
  sectionId: z.string().min(1),
  subsectionId: z.string().min(1),
  type: z.literal("direct_fields"),
  fields: z.record(z.string(), FieldValueWithSourceSchema),
  selected: z.boolean(),
  status: ProposalStatusSchema,
  warnings: z.array(z.string()).optional(),
});

/**
 * Proposed record schema
 */
export const ProposedRecordSchema = z.object({
  temporaryId: z.string().min(1),
  fields: z.record(z.string(), z.unknown()),
  confidence: z.number().min(0).max(1),
  sourceText: z.string(),
  sourcePage: z.number().int().positive().optional(),
  selected: z.boolean(),
});

/**
 * Record list import proposal schema
 */
export const RecordListImportProposalSchema = z.object({
  proposalId: z.string().min(1),
  sectionId: z.string().min(1),
  subsectionId: z.string().min(1),
  type: z.literal("record_list"),
  records: z.array(ProposedRecordSchema).min(1),
  status: ProposalStatusSchema,
  warnings: z.array(z.string()).optional(),
});

/**
 * Portfolio import proposal (discriminated union)
 */
export const PortfolioImportProposalSchema = z.discriminatedUnion("type", [
  DirectFieldsImportProposalSchema,
  RecordListImportProposalSchema,
]);

/**
 * Proposal validation result schema
 */
export const ProposalValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});

/**
 * Grouped proposals schema
 */
export const GroupedProposalsSchema = z.object({
  sectionId: z.string(),
  sectionTitle: z.string(),
  proposals: z.array(PortfolioImportProposalSchema),
});

/**
 * Валидация на импорт предложение
 */
export function validateImportProposal(proposal: unknown) {
  return PortfolioImportProposalSchema.safeParse(proposal);
}

/**
 * Валидация на масив от предложения
 */
export function validateImportProposals(proposals: unknown) {
  return z.array(PortfolioImportProposalSchema).safeParse(proposals);
}
