/**
 * Subsection Data Storage
 * Съхранение на данни за подсекции в портфолио
 */

const STORAGE_KEY_PREFIX = "epo_portfolio_data_";

export interface SubsectionData {
  portfolioId: string;
  subsectionId: string;
  data: Record<string, unknown>;
  updatedAt: string;
}

/**
 * Subsection Data Storage class
 */
class SubsectionDataStorage {
  /**
   * Взема данните за подсекция
   */
  getData(portfolioId: string, subsectionId: string): Record<string, unknown> | null {
    if (typeof window === "undefined") return null;

    const key = this.getKey(portfolioId, subsectionId);
    const data = localStorage.getItem(key);

    if (!data) return null;

    try {
      const parsed = JSON.parse(data) as SubsectionData;
      return parsed.data;
    } catch {
      return null;
    }
  }

  /**
   * Запазва данните за подсекция
   */
  saveData(
    portfolioId: string,
    subsectionId: string,
    data: Record<string, unknown>
  ): void {
    if (typeof window === "undefined") return;

    const subsectionData: SubsectionData = {
      portfolioId,
      subsectionId,
      data,
      updatedAt: new Date().toISOString(),
    };

    const key = this.getKey(portfolioId, subsectionId);
    localStorage.setItem(key, JSON.stringify(subsectionData));
  }

  /**
   * Изтрива данните за подсекция
   */
  deleteData(portfolioId: string, subsectionId: string): void {
    if (typeof window === "undefined") return;

    const key = this.getKey(portfolioId, subsectionId);
    localStorage.removeItem(key);
  }

  /**
   * Взема всички данни за портфолио
   */
  getAllPortfolioData(portfolioId: string): Record<string, Record<string, unknown>> {
    if (typeof window === "undefined") return {};

    const result: Record<string, Record<string, unknown>> = {};
    const prefix = STORAGE_KEY_PREFIX + portfolioId + "_";

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data) as SubsectionData;
            result[parsed.subsectionId] = parsed.data;
          } catch {
            // Skip invalid data
          }
        }
      }
    }

    return result;
  }

  /**
   * Генерира ключ за localStorage
   */
  private getKey(portfolioId: string, subsectionId: string): string {
    return `${STORAGE_KEY_PREFIX}${portfolioId}_${subsectionId}`;
  }
}

/**
 * Default storage instance
 */
export const subsectionDataStorage = new SubsectionDataStorage();
