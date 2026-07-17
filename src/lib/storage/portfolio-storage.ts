/**
 * Portfolio Storage Service
 * Локално съхранение на портфолиа (localStorage)
 */

import { Portfolio, CreatePortfolioInput } from "@/types/portfolio-data";

const STORAGE_KEY = "epo_portfolios";

/**
 * Portfolio Storage class
 */
class PortfolioStorage {
  /**
   * Взема всички портфолиа
   */
  getAll(): Portfolio[] {
    if (typeof window === "undefined") return [];
    
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    try {
      return JSON.parse(data) as Portfolio[];
    } catch {
      return [];
    }
  }

  /**
   * Взема портфолио по ID
   */
  getById(id: string): Portfolio | null {
    const portfolios = this.getAll();
    return portfolios.find((p) => p.id === id) || null;
  }

  /**
   * Създава ново портфолио
   */
  create(input: CreatePortfolioInput): Portfolio {
    const portfolio: Portfolio = {
      id: crypto.randomUUID(),
      name: input.name,
      epoUserId: input.epoUserId,
      epoPortfolioId: input.epoPortfolioId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const portfolios = this.getAll();
    portfolios.push(portfolio);
    this.saveAll(portfolios);

    return portfolio;
  }

  /**
   * Обновява портфолио
   */
  update(id: string, updates: Partial<CreatePortfolioInput>): Portfolio | null {
    const portfolios = this.getAll();
    const index = portfolios.findIndex((p) => p.id === id);

    if (index === -1) return null;

    portfolios[index] = {
      ...portfolios[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveAll(portfolios);
    return portfolios[index];
  }

  /**
   * Изтрива портфолио
   */
  delete(id: string): boolean {
    const portfolios = this.getAll();
    const filtered = portfolios.filter((p) => p.id !== id);

    if (filtered.length === portfolios.length) return false;

    this.saveAll(filtered);
    return true;
  }

  /**
   * Записва всички портфолиа
   */
  private saveAll(portfolios: Portfolio[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
  }
}

/**
 * Default portfolio storage instance
 */
export const portfolioStorage = new PortfolioStorage();
