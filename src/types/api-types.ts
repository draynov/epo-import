/**
 * Типове за EPO.bg API интеграция
 */

/**
 * Базов request към epo.bg/api2
 */
export interface EpoApiBaseRequest {
  portfolio: number;
  users: number;
  cmd: string;
}

/**
 * Response от epo.bg API
 */
export interface EpoApiResponse {
  Message: string;
}

/**
 * Success response
 */
export interface EpoApiSuccessResponse extends EpoApiResponse {
  Message: "Успешно завършено";
  data?: unknown;
}

/**
 * Error response
 */
export interface EpoApiErrorResponse extends EpoApiResponse {
  Message: string; // "Няма на съобщение" или друго error съобщение
}

/**
 * Тип guard за проверка на success response
 */
export function isEpoApiSuccess(
  response: EpoApiResponse
): response is EpoApiSuccessResponse {
  return response.Message === "Успешно завършено";
}

/**
 * Request payload за импорт на подсекция
 */
export interface SubsectionImportRequest extends EpoApiBaseRequest {
  [key: string]: unknown; // Динамични полета според подсекцията
}

/**
 * Статус на изпращане на предложение
 */
export type SubmissionStatus = "pending" | "success" | "error" | "skipped";

/**
 * Резултат от изпращане на едно предложение
 */
export interface ProposalSubmissionResult {
  proposalId: string;
  subsectionId: string;
  status: SubmissionStatus;
  response?: EpoApiResponse;
  error?: string;
}

/**
 * Обобщен резултат от импорт
 */
export interface ImportSummary {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  results: ProposalSubmissionResult[];
}
