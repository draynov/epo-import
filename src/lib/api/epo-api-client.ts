/**
 * EPO API Client
 * Client for communication with https://epo.bg/api2/
 */

import {
  EPO_API_CONFIG,
  EpoApiResponse,
  EpoApiBaseRequest,
  EpoPortfolioRequest,
} from './epo-api-types';
import { transformPortfolioToEpoApi } from './epo-api-transform';
import { supabaseSubsectionDataStorage } from '../storage/supabase-subsection-data-storage';

/**
 * API Client Error
 */
export class EpoApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorResponse?: { Error: string }
  ) {
    super(message);
    this.name = 'EpoApiError';
  }
}

/**
 * Check if API response is success
 */
export function isEpoApiSuccess(response: EpoApiResponse): response is { Message: string } {
  return 'Message' in response;
}

/**
 * Check if API response is error
 */
export function isEpoApiError(response: EpoApiResponse): response is { Error: string } {
  return 'Error' in response;
}

/**
 * EPO API Client class
 */
export class EpoApiClient {
  private baseUrl: string;
  private token: string;
  private timeout: number;

  constructor(
    baseUrl: string = EPO_API_CONFIG.BASE_URL,
    token: string = EPO_API_CONFIG.TOKEN,
    timeout: number = 30000
  ) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.timeout = timeout;
  }

  /**
   * Send POST request to EPO API
   */
  async post(payload: EpoApiBaseRequest & Record<string, unknown>): Promise<EpoApiResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      // Convert payload to FormData (API expects form-urlencoded)
      const formData = new URLSearchParams();
      
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new EpoApiError(
          `HTTP error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json() as EpoApiResponse;

      // Check if response contains Error
      if (isEpoApiError(data)) {
        throw new EpoApiError(
          `API Error: ${data.Error}`,
          undefined,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof EpoApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new EpoApiError(`Request timeout after ${this.timeout}ms`);
        }
        throw new EpoApiError(`Network error: ${error.message}`);
      }

      throw new EpoApiError('Unknown error occurred');
    }
  }

  /**
   * Sync portfolio data from Supabase to EPO API
   */
  async syncPortfolioData(
    portfolioId: string,
    epoPortfolioId: string,
    epoUserId: string
  ): Promise<EpoApiResponse> {
    // Load all subsection data from Supabase
    const subsectionData = await this.loadAllSubsectionData(portfolioId);
    
    // Transform to EPO API format
    const transformedData = transformPortfolioToEpoApi(
      portfolioId,
      epoUserId,
      subsectionData
    );
    
    // Build request payload
    const payload: Partial<EpoPortfolioRequest> = {
      token: this.token,
      portfolio: epoPortfolioId,
      users: epoUserId,
      cmd: 'portfolio',
      ...transformedData,
    };
    
    // Remove undefined/null values
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null)
    );
    
    return this.post(cleanPayload as EpoApiBaseRequest);
  }

  /**
   * Load subsection data for portfolio module from Supabase
   * Зарежда: лични данни (1.1) + трудова история (1.2) + рефлексия (1.6)
   */
  private async loadAllSubsectionData(
    portfolioId: string
  ): Promise<Record<string, Record<string, unknown>>> {
    const data: Record<string, Record<string, unknown>> = {};
    
    // Load subsections needed for portfolio module
    const subsections = [
      'section_1_subsection_1_1', // Personal data - име, email, phone, гражданство, стаж
      'section_1_subsection_1_2', // Work history - актуална длъжност и институция
      'section_1_subsection_1_6', // Reflection - любим цитат (motto)
    ];
    
    for (const subsectionId of subsections) {
      try {
        const subsectionData = await supabaseSubsectionDataStorage.getData(
          portfolioId,
          subsectionId
        );
        
        if (subsectionData) {
          data[subsectionId] = subsectionData as Record<string, unknown>;
        }
      } catch (error) {
        console.warn(`Failed to load subsection ${subsectionId}:`, error);
        // Continue with other subsections
      }
    }
    
    return data;
  }
}

// Export singleton instance
export const epoApiClient = new EpoApiClient();
