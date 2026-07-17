/**
 * Portfolio Types
 * Типове за портфолио обекти
 */

export interface Portfolio {
  id: string; // Local ID (UUID)
  name: string; // Наименование
  epoUserId: number; // User ID от EPO
  epoPortfolioId: number; // Portfolio ID от EPO
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreatePortfolioInput {
  name: string;
  epoUserId: number;
  epoPortfolioId: number;
}
