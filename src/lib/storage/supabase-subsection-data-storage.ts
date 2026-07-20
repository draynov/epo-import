/**
 * Supabase Subsection Data Storage
 * Replaces localStorage with Supabase database for portfolio data
 */

import { supabase } from '@/lib/supabase/client';

export interface SubsectionData {
  portfolioId: string;
  subsectionId: string;
  data: Record<string, unknown>;
  updatedAt: string;
}

/**
 * Supabase Subsection Data Storage class
 */
class SupabaseSubsectionDataStorage {
  /**
   * Get data for a subsection
   */
  async getData(portfolioId: string, subsectionId: string): Promise<Record<string, unknown> | null> {
    const { data, error } = await supabase
      .from('portfolio_data')
      .select('data')
      .eq('portfolio_id', portfolioId)
      .eq('subsection_id', subsectionId)
      .single();

    if (error || !data) {
      // Not found is not an error - just return null
      return null;
    }

    return data.data as Record<string, unknown>;
  }

  /**
   * Save data for a subsection
   */
  async saveData(
    portfolioId: string,
    subsectionId: string,
    data: Record<string, unknown>
  ): Promise<boolean> {
    // Use upsert to insert or update
    const { error } = await supabase
      .from('portfolio_data')
      .upsert(
        {
          portfolio_id: portfolioId,
          subsection_id: subsectionId,
          data: data,
        },
        {
          onConflict: 'portfolio_id,subsection_id',
        }
      );

    if (error) {
      console.error('Error saving subsection data:', error);
      return false;
    }

    return true;
  }

  /**
   * Delete data for a subsection
   */
  async deleteData(portfolioId: string, subsectionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('portfolio_data')
      .delete()
      .eq('portfolio_id', portfolioId)
      .eq('subsection_id', subsectionId);

    if (error) {
      console.error('Error deleting subsection data:', error);
      return false;
    }

    return true;
  }

  /**
   * Get all data for a portfolio
   */
  async getAllPortfolioData(portfolioId: string): Promise<Record<string, Record<string, unknown>>> {
    const { data, error } = await supabase
      .from('portfolio_data')
      .select('subsection_id, data')
      .eq('portfolio_id', portfolioId);

    if (error || !data) {
      console.error('Error fetching portfolio data:', error);
      return {};
    }

    const result: Record<string, Record<string, unknown>> = {};
    
    data.forEach((item) => {
      result[item.subsection_id] = item.data as Record<string, unknown>;
    });

    return result;
  }
}

/**
 * Default Supabase subsection data storage instance
 */
export const supabaseSubsectionDataStorage = new SupabaseSubsectionDataStorage();
