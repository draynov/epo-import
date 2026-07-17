/**
 * Import Service
 * Сервиз за импортиране на портфолио предложения към EPO API
 */

import {
  PortfolioImportProposal,
  ProposalSubmissionResult,
  ImportSummary,
} from "@/types";
import { epoApiClient, EpoApiError } from "./epo-api-client";
import { findSubsection } from "@/config/portfolio-schema";

/**
 * Import Service class
 */
export class ImportService {
  /**
   * Изпраща едно предложение към API
   */
  async submitProposal(
    portfolioId: number,
    userId: number,
    proposal: PortfolioImportProposal
  ): Promise<ProposalSubmissionResult> {
    try {
      // Намираме подсекцията от конфигурацията
      const found = findSubsection(proposal.subsectionId);
      if (!found) {
        return {
          proposalId: proposal.proposalId,
          subsectionId: proposal.subsectionId,
          status: "error",
          error: `Unknown subsection: ${proposal.subsectionId}`,
        };
      }

      const { subsection } = found;
      const cmd = subsection.endpoint.cmd;

      if (proposal.type === "direct_fields") {
        // За директни полета изпращаме един request с всички полета
        const data: Record<string, unknown> = {};
        
        for (const [key, fieldData] of Object.entries(proposal.fields)) {
          data[key] = fieldData.value;
        }

        const response = await epoApiClient.submitSubsectionData(
          portfolioId,
          userId,
          cmd,
          data
        );

        if (epoApiClient.isSuccess(response)) {
          return {
            proposalId: proposal.proposalId,
            subsectionId: proposal.subsectionId,
            status: "success",
            response,
          };
        } else {
          return {
            proposalId: proposal.proposalId,
            subsectionId: proposal.subsectionId,
            status: "error",
            response,
            error: response.Message,
          };
        }
      } else {
        // За record_list изпращаме всеки избран запис поотделно
        const selectedRecords = proposal.records.filter((r) => r.selected);

        if (selectedRecords.length === 0) {
          return {
            proposalId: proposal.proposalId,
            subsectionId: proposal.subsectionId,
            status: "skipped",
            error: "No records selected",
          };
        }

        // Изпращаме първия запис (можем да добавим batch логика по-късно)
        const firstRecord = selectedRecords[0];
        const response = await epoApiClient.submitSubsectionData(
          portfolioId,
          userId,
          cmd,
          firstRecord.fields
        );

        if (epoApiClient.isSuccess(response)) {
          return {
            proposalId: proposal.proposalId,
            subsectionId: proposal.subsectionId,
            status: "success",
            response,
          };
        } else {
          return {
            proposalId: proposal.proposalId,
            subsectionId: proposal.subsectionId,
            status: "error",
            response,
            error: response.Message,
          };
        }
      }
    } catch (error) {
      if (error instanceof EpoApiError) {
        return {
          proposalId: proposal.proposalId,
          subsectionId: proposal.subsectionId,
          status: "error",
          error: error.message,
        };
      }

      return {
        proposalId: proposal.proposalId,
        subsectionId: proposal.subsectionId,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Изпраща множество предложения
   */
  async submitProposals(
    portfolioId: number,
    userId: number,
    proposals: PortfolioImportProposal[]
  ): Promise<ImportSummary> {
    const results: ProposalSubmissionResult[] = [];

    // Филтрираме само одобрените предложения
    const approvedProposals = proposals.filter(
      (p) => p.status === "approved" || p.status === "edited"
    );

    for (const proposal of approvedProposals) {
      const result = await this.submitProposal(portfolioId, userId, proposal);
      results.push(result);
    }

    // Обобщаваме резултатите
    const summary: ImportSummary = {
      total: approvedProposals.length,
      successful: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "error").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      results,
    };

    return summary;
  }

  /**
   * Изпраща record list batch
   */
  async submitRecordListBatch(
    portfolioId: number,
    userId: number,
    subsectionId: string,
    records: Array<Record<string, unknown>>
  ): Promise<ProposalSubmissionResult[]> {
    const found = findSubsection(subsectionId);
    if (!found) {
      return [
        {
          proposalId: "batch",
          subsectionId,
          status: "error",
          error: `Unknown subsection: ${subsectionId}`,
        },
      ];
    }

    const { subsection } = found;
    const cmd = subsection.endpoint.cmd;

    const results: ProposalSubmissionResult[] = [];

    for (let i = 0; i < records.length; i++) {
      try {
        const response = await epoApiClient.submitSubsectionData(
          portfolioId,
          userId,
          cmd,
          records[i]
        );

        results.push({
          proposalId: `batch-${i}`,
          subsectionId,
          status: epoApiClient.isSuccess(response) ? "success" : "error",
          response,
          error: epoApiClient.isSuccess(response)
            ? undefined
            : response.Message,
        });
      } catch (error) {
        results.push({
          proposalId: `batch-${i}`,
          subsectionId,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }
}

/**
 * Default import service instance
 */
export const importService = new ImportService();
