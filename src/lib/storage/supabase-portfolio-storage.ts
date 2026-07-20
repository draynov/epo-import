/**
 * Supabase Portfolio Storage Service
 * Replaces localStorage with Supabase database
 */

import { supabase } from '@/lib/supabase/client';
import { Portfolio, CreatePortfolioInput } from '@/types/portfolio-data';

/**
 * Supabase Portfolio Storage class
 */
class SupabasePortfolioStorage {
  /**
   * Get all portfolios for current user
   */
  async getAll(): Promise<Portfolio[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching portfolios:', error);
      return [];
    }

    return (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      epoUserId: p.epo_user_id,
      epoPortfolioId: p.epo_portfolio_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  }

  /**
   * Get portfolio by ID
   */
  async getById(id: string): Promise<Portfolio | null> {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching portfolio:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      epoUserId: data.epo_user_id,
      epoPortfolioId: data.epo_portfolio_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Create new portfolio
   */
  async create(input: CreatePortfolioInput): Promise<Portfolio | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user');
      return null;
    }

    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        name: input.name,
        epo_user_id: input.epoUserId,
        epo_portfolio_id: input.epoPortfolioId,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating portfolio:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      epoUserId: data.epo_user_id,
      epoPortfolioId: data.epo_portfolio_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Update portfolio
   */
  async update(id: string, updates: Partial<CreatePortfolioInput>): Promise<Portfolio | null> {
    const updateData: Record<string, string> = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.epoUserId) updateData.epo_user_id = updates.epoUserId;
    if (updates.epoPortfolioId) updateData.epo_portfolio_id = updates.epoPortfolioId;

    const { data, error } = await supabase
      .from('portfolios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating portfolio:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      epoUserId: data.epo_user_id,
      epoPortfolioId: data.epo_portfolio_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Delete portfolio
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting portfolio:', error);
      return false;
    }

    return true;
  }
}

/**
 * Default Supabase portfolio storage instance
 */
export const supabasePortfolioStorage = new SupabasePortfolioStorage();
