/**
 * EPO API Client
 * Client за комуникация с https://epo.bg/api2/
 */

import {
  EpoApiBaseRequest,
  EpoApiResponse,
  isEpoApiSuccess,
} from "@/types";
import { validateApiRequest, validateApiResponse } from "../validation";

/**
 * API Configuration
 */
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_EPO_API_URL || "https://epo.bg/api2/",
  timeout: 30000, // 30 seconds
};

/**
 * API Client Error
 */
export class EpoApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: EpoApiResponse
  ) {
    super(message);
    this.name = "EpoApiError";
  }
}

/**
 * EPO API Client class
 */
export class EpoApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl?: string, timeout?: number) {
    this.baseUrl = baseUrl || API_CONFIG.baseUrl;
    this.timeout = timeout || API_CONFIG.timeout;
  }

  /**
   * Изпраща POST заявка към EPO API
   */
  async post<T = unknown>(
    payload: EpoApiBaseRequest & Record<string, unknown>
  ): Promise<EpoApiResponse> {
    // Валидация на request
    const validationResult = validateApiRequest(payload);
    if (!validationResult.success) {
      throw new EpoApiError(
        `Invalid request payload: ${validationResult.error.message}`
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new EpoApiError(
          `HTTP error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();

      // Валидация на response
      const responseValidation = validateApiResponse(data);
      if (!responseValidation.success) {
        throw new EpoApiError(
          `Invalid response format: ${responseValidation.error.message}`
        );
      }

      return data as EpoApiResponse;
    } catch (error) {
      if (error instanceof EpoApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new EpoApiError(`Request timeout after ${this.timeout}ms`);
        }
        throw new EpoApiError(`Network error: ${error.message}`);
      }

      throw new EpoApiError("Unknown error occurred");
    }
  }

  /**
   * Проверява дали response е успешен
   */
  isSuccess(response: EpoApiResponse): boolean {
    return isEpoApiSuccess(response);
  }

  /**
   * Изпраща данни за portfolio (директни полета)
   */
  async submitPortfolioData(
    portfolioId: number,
    userId: number,
    data: Record<string, unknown>
  ): Promise<EpoApiResponse> {
    return this.post({
      portfolio: portfolioId,
      users: userId,
      cmd: "portfolio",
      ...data,
    });
  }

  /**
   * Изпраща данни за подсекция (generic)
   */
  async submitSubsectionData(
    portfolioId: number,
    userId: number,
    cmd: string,
    data: Record<string, unknown>
  ): Promise<EpoApiResponse> {
    return this.post({
      portfolio: portfolioId,
      users: userId,
      cmd,
      ...data,
    });
  }

  /**
   * Batch изпращане на множество записи
   */
  async submitBatch(
    portfolioId: number,
    userId: number,
    cmd: string,
    records: Array<Record<string, unknown>>
  ): Promise<EpoApiResponse[]> {
    const results: EpoApiResponse[] = [];

    for (const record of records) {
      try {
        const response = await this.submitSubsectionData(
          portfolioId,
          userId,
          cmd,
          record
        );
        results.push(response);
      } catch (error) {
        if (error instanceof EpoApiError) {
          results.push({
            Message: error.message,
          });
        } else {
          results.push({
            Message: "Unknown error",
          });
        }
      }
    }

    return results;
  }
}

/**
 * Default API client instance
 */
export const epoApiClient = new EpoApiClient();
