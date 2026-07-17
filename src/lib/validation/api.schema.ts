/**
 * Zod схеми за EPO API валидация
 */

import { z } from "zod";

/**
 * EPO API Base Request Schema
 */
export const EpoApiBaseRequestSchema = z.object({
  portfolio: z.number().int().positive(),
  users: z.number().int().positive(),
  cmd: z.string().min(1),
});

/**
 * EPO API Response Schema
 */
export const EpoApiResponseSchema = z.object({
  Message: z.string(),
});

/**
 * EPO API Success Response Schema
 */
export const EpoApiSuccessResponseSchema = EpoApiResponseSchema.extend({
  Message: z.literal("Успешно завършено"),
  data: z.unknown().optional(),
});

/**
 * EPO API Error Response Schema
 */
export const EpoApiErrorResponseSchema = EpoApiResponseSchema.extend({
  Message: z.string(),
});

/**
 * Submission Status Schema
 */
export const SubmissionStatusSchema = z.enum([
  "pending",
  "success",
  "error",
  "skipped",
]);

/**
 * Proposal Submission Result Schema
 */
export const ProposalSubmissionResultSchema = z.object({
  proposalId: z.string(),
  subsectionId: z.string(),
  status: SubmissionStatusSchema,
  response: EpoApiResponseSchema.optional(),
  error: z.string().optional(),
});

/**
 * Import Summary Schema
 */
export const ImportSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  successful: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  results: z.array(ProposalSubmissionResultSchema),
});

/**
 * Валидация на API request
 */
export function validateApiRequest(request: unknown) {
  return EpoApiBaseRequestSchema.safeParse(request);
}

/**
 * Валидация на API response
 */
export function validateApiResponse(response: unknown) {
  return EpoApiResponseSchema.safeParse(response);
}

/**
 * Проверка дали response е success
 */
export function isSuccessResponse(
  response: unknown
): response is z.infer<typeof EpoApiSuccessResponseSchema> {
  const result = EpoApiSuccessResponseSchema.safeParse(response);
  return result.success;
}
