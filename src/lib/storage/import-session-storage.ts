/**
 * Import Session Storage
 * Stores parsed HTML data and mapping progress between import steps
 * Uses sessionStorage to persist data during the multi-step import flow
 */

import { ParsedHTMLData } from '@/lib/parsers/html-parser';
import { Section1Mapping } from '@/lib/mapping/section-1-mapper';

const STORAGE_KEYS = {
  PARSED_DATA: 'epo_import_parsed_data',
  PORTFOLIO_ID: 'epo_import_portfolio_id',
  SECTION_1_MAPPING: 'epo_import_section_1_mapping',
  SECTION_2_MAPPING: 'epo_import_section_2_mapping',
  SECTION_3_MAPPING: 'epo_import_section_3_mapping',
  SECTION_4_MAPPING: 'epo_import_section_4_mapping',
  SECTION_5_MAPPING: 'epo_import_section_5_mapping',
  SECTION_6_MAPPING: 'epo_import_section_6_mapping',
  COMPLETED_SECTIONS: 'epo_import_completed_sections',
};

export class ImportSessionStorage {
  /**
   * Initialize import session with parsed data and portfolio ID
   */
  static initSession(portfolioId: string, parsedData: ParsedHTMLData): void {
    if (typeof window === 'undefined') return;
    
    sessionStorage.setItem(STORAGE_KEYS.PORTFOLIO_ID, portfolioId);
    sessionStorage.setItem(STORAGE_KEYS.PARSED_DATA, JSON.stringify(parsedData));
    sessionStorage.setItem(STORAGE_KEYS.COMPLETED_SECTIONS, JSON.stringify([]));
  }

  /**
   * Get portfolio ID from session
   */
  static getPortfolioId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(STORAGE_KEYS.PORTFOLIO_ID);
  }

  /**
   * Get parsed HTML data from session
   */
  static getParsedData(): ParsedHTMLData | null {
    if (typeof window === 'undefined') return null;
    
    const data = sessionStorage.getItem(STORAGE_KEYS.PARSED_DATA);
    if (!data) return null;
    
    try {
      return JSON.parse(data) as ParsedHTMLData;
    } catch (error) {
      console.error('Failed to parse stored data:', error);
      return null;
    }
  }

  /**
   * Save section mapping
   */
  static saveSectionMapping(sectionNumber: number, mapping: unknown): void {
    if (typeof window === 'undefined') return;
    
    const key = `epo_import_section_${sectionNumber}_mapping`;
    sessionStorage.setItem(key, JSON.stringify(mapping));
    
    // Mark section as completed
    const completed = this.getCompletedSections();
    if (!completed.includes(sectionNumber)) {
      completed.push(sectionNumber);
      sessionStorage.setItem(STORAGE_KEYS.COMPLETED_SECTIONS, JSON.stringify(completed));
    }
  }

  /**
   * Get section mapping
   */
  static getSectionMapping(sectionNumber: number): unknown | null {
    if (typeof window === 'undefined') return null;
    
    const key = `epo_import_section_${sectionNumber}_mapping`;
    const data = sessionStorage.getItem(key);
    
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to parse section ${sectionNumber} mapping:`, error);
      return null;
    }
  }

  /**
   * Get list of completed section numbers
   */
  static getCompletedSections(): number[] {
    if (typeof window === 'undefined') return [];
    
    const data = sessionStorage.getItem(STORAGE_KEYS.COMPLETED_SECTIONS);
    if (!data) return [];
    
    try {
      return JSON.parse(data) as number[];
    } catch (error) {
      console.error('Failed to parse completed sections:', error);
      return [];
    }
  }

  /**
   * Get all section mappings
   */
  static getAllMappings(): Record<number, unknown> {
    const mappings: Record<number, unknown> = {};
    
    for (let i = 1; i <= 6; i++) {
      const mapping = this.getSectionMapping(i);
      if (mapping) {
        mappings[i] = mapping;
      }
    }
    
    return mappings;
  }

  /**
   * Clear import session
   */
  static clearSession(): void {
    if (typeof window === 'undefined') return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
    });
  }

  /**
   * Check if import session exists
   */
  static hasActiveSession(): boolean {
    if (typeof window === 'undefined') return false;
    return !!sessionStorage.getItem(STORAGE_KEYS.PORTFOLIO_ID);
  }
}
