/**
 * Типове за AI предложения за импорт
 */

/**
 * Базова информация за източник на данни
 */
export interface ProposalSource {
  sourceText: string;
  confidence: number; // 0-1
  sourcePage?: number;
}

/**
 * Статус на предложение
 */
export type ProposalStatus = "pending" | "approved" | "rejected" | "edited";

/**
 * Предложение за директни полета
 */
export interface DirectFieldsImportProposal {
  proposalId: string;
  sectionId: string;
  subsectionId: string;
  type: "direct_fields";
  
  fields: Record<
    string,
    {
      value: unknown;
      confidence: number;
      sourceText: string;
      sourcePage?: number;
    }
  >;
  
  selected: boolean;
  status: ProposalStatus;
  warnings?: string[];
}

/**
 * Един запис в списъчна подсекция
 */
export interface ProposedRecord {
  temporaryId: string;
  fields: Record<string, unknown>;
  confidence: number;
  sourceText: string;
  sourcePage?: number;
  selected: boolean;
}

/**
 * Предложение за списък от записи
 */
export interface RecordListImportProposal {
  proposalId: string;
  sectionId: string;
  subsectionId: string;
  type: "record_list";
  
  records: ProposedRecord[];
  
  status: ProposalStatus;
  warnings?: string[];
}

/**
 * Union тип за предложения (discriminated union)
 */
export type PortfolioImportProposal =
  | DirectFieldsImportProposal
  | RecordListImportProposal;

/**
 * Резултат от валидация на предложение
 */
export interface ProposalValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Grouped proposals по секции
 */
export interface GroupedProposals {
  sectionId: string;
  sectionTitle: string;
  proposals: PortfolioImportProposal[];
}
