/**
 * Portfolio Types
 * Типове за портфолио обекти
 */

export interface Portfolio {
  id: string; // Local ID (UUID)
  name: string; // Наименование
  epoUserId: string; // User ID от EPO
  epoPortfolioId: string; // Portfolio ID от EPO
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreatePortfolioInput {
  name: string;
  epoUserId: string;
  epoPortfolioId: string;
}
