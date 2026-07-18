/**
 * Mapping service for Section 1: General Information
 * Maps parsed HTML data to Section 1 structure
 */

import { ParsedHTMLData } from '@/lib/parsers/html-parser';
import { SECTION_1_GENERAL_INFO } from '@/config/sections/section-1-general';

export interface FieldMapping {
  targetField: string; // Key in Section 1
  targetLabel: string; // Label in Section 1
  sourceValue: string; // Extracted value from HTML
  sourceLabel: string; // Where it came from
  confidence: 'high' | 'medium' | 'low';
  subsectionId: string;
  subsectionTitle: string;
}

export interface RecordMapping {
  targetSubsection: string;
  targetLabel: string;
  records: Record<string, string>[]; // Array of mapped records
  sourceTable: string; // Source table name
  confidence: 'high' | 'medium' | 'low';
}

export interface Section1Mapping {
  fields: FieldMapping[];
  records: RecordMapping[];
}

/**
 * Map parsed HTML data to Section 1 structure
 */
export function mapToSection1(parsedData: ParsedHTMLData): Section1Mapping {
  const fields: FieldMapping[] = [];
  const records: RecordMapping[] = [];

  // Extract profile name field
  const nameField = parsedData.rawTextFields.find(
    f => f.label === 'Име' || f.label.toLowerCase().includes('име')
  );

  if (nameField) {
    // Split full name into first, middle, last
    const nameParts = nameField.value.trim().split(/\s+/);
    
    if (nameParts.length >= 1) {
      fields.push({
        targetField: 'portfolio_name',
        targetLabel: 'Име',
        sourceValue: nameParts[0],
        sourceLabel: 'Име (от профил)',
        confidence: 'high',
        subsectionId: 'basic-info',
        subsectionTitle: 'Основна информация',
      });
    }
    
    if (nameParts.length >= 2) {
      fields.push({
        targetField: 'portfolio_surname',
        targetLabel: 'Презиме',
        sourceValue: nameParts[1],
        sourceLabel: 'Име (от профил)',
        confidence: 'high',
        subsectionId: 'basic-info',
        subsectionTitle: 'Основна информация',
      });
    }
    
    if (nameParts.length >= 3) {
      fields.push({
        targetField: 'portfolio_family',
        targetLabel: 'Фамилия',
        sourceValue: nameParts.slice(2).join(' '),
        sourceLabel: 'Име (от профил)',
        confidence: 'high',
        subsectionId: 'basic-info',
        subsectionTitle: 'Основна информация',
      });
    }
  }

  // Extract email
  let emailField = parsedData.rawTextFields.find(
    f => f.label.toLowerCase().includes('имейл') || f.label.toLowerCase().includes('email') || f.label.toLowerCase().includes('и-мейл')
  );

  // Also check in tables (email might be in a 2-column table: "Заглавие" | "Описание")
  if (!emailField) {
    for (const section of parsedData.sections) {
      for (const table of section.tables) {
        const emailRow = table.rows.find(row => {
          const title = (row['Заглавие'] || row['заглавие'] || '').toLowerCase();
          return title.includes('имейл') || title.includes('email') || title.includes('и-мейл');
        });
        if (emailRow) {
          const emailValue = emailRow['Описание'] || emailRow['описание'] || '';
          if (emailValue) {
            emailField = { label: 'И-мейл', value: emailValue };
            break;
          }
        }
      }
      if (emailField) break;
    }
  }

  if (emailField && emailField.value) {
    fields.push({
      targetField: 'email',
      targetLabel: 'E-mail',
      sourceValue: emailField.value,
      sourceLabel: 'И-мейл (от профил)',
      confidence: 'high',
      subsectionId: 'basic-info',
      subsectionTitle: 'Основна информация',
    });
  }

  // Extract phone
  let phoneField = parsedData.rawTextFields.find(
    f => f.label.toLowerCase().includes('телефон') || f.label.toLowerCase().includes('phone')
  );

  // Also check in tables
  if (!phoneField) {
    for (const section of parsedData.sections) {
      for (const table of section.tables) {
        const phoneRow = table.rows.find(row => {
          const title = (row['Заглавие'] || row['заглавие'] || '').toLowerCase();
          return title.includes('телефон') || title.includes('phone');
        });
        if (phoneRow) {
          const phoneValue = phoneRow['Описание'] || phoneRow['описание'] || '';
          if (phoneValue) {
            phoneField = { label: 'Телефон', value: phoneValue };
            break;
          }
        }
      }
      if (phoneField) break;
    }
  }

  if (phoneField && phoneField.value) {
    fields.push({
      targetField: 'phone',
      targetLabel: 'Телефон',
      sourceValue: phoneField.value,
      sourceLabel: 'Телефон (от профил)',
      confidence: 'high',
      subsectionId: 'basic-info',
      subsectionTitle: 'Основна информация',
    });
  }

  // Extract favorite quote/description
  const descriptionField = parsedData.rawTextFields.find(
    f => f.label === 'Описание' || f.label.toLowerCase().includes('описание')
  );

  if (descriptionField && descriptionField.value) {
    fields.push({
      targetField: 'citat',
      targetLabel: 'Любим цитат',
      sourceValue: descriptionField.value,
      sourceLabel: 'Описание (от профил)',
      confidence: 'medium',
      subsectionId: 'favorite-quote',
      subsectionTitle: 'Любим цитат',
    });
  }

  // Map work history (position history)
  const workHistorySection = parsedData.sections.find(
    s => s.title?.toLowerCase().includes('учителски стаж') || 
         s.title?.toLowerCase().includes('стаж') ||
         s.title?.toLowerCase().includes('работа')
  );

  if (workHistorySection && workHistorySection.tables.length > 0) {
    const table = workHistorySection.tables[0];
    
    const mappedRecords = table.rows.map(row => {
      const period = row['Период'] || row['период'] || '';
      const institution = row['Институция'] || row['Заглавие'] || row['заглавие'] || '';
      const position = row['Длъжност'] || row['Описание'] || row['описание'] || '';

      // Parse period (e.g., "2015-2020" or "09/2015 - 06/2020")
      const { yearFrom, yearTo, nowTo } = parsePeriod(period);

      return {
        godina_from: yearFrom,
        godina_to: yearTo,
        now_to: nowTo ? 'true' : '',
        institution: institution,
        position: position,
      };
    });

    records.push({
      targetSubsection: 'position-history',
      targetLabel: 'История на длъжностите',
      records: mappedRecords,
      sourceTable: workHistorySection.title || 'Учителски стаж',
      confidence: 'high',
    });
  }

  return { fields, records };
}

/**
 * Parse period string into year from/to
 * Examples: "2015-2020", "09/2015 - 06/2020", "2015 - До момента"
 */
function parsePeriod(period: string): { yearFrom: string; yearTo: string; nowTo: boolean } {
  let yearFrom = '';
  let yearTo = '';
  let nowTo = false;

  if (!period) {
    return { yearFrom, yearTo, nowTo };
  }

  // Check if "до момента" or similar
  if (period.toLowerCase().includes('момента') || 
      period.toLowerCase().includes('сега') ||
      period.toLowerCase().includes('настояще')) {
    nowTo = true;
  }

  // Extract years using regex
  const yearMatches = period.match(/\d{4}/g);
  
  if (yearMatches && yearMatches.length >= 1) {
    yearFrom = yearMatches[0];
    if (yearMatches.length >= 2 && !nowTo) {
      yearTo = yearMatches[1];
    }
  }

  return { yearFrom, yearTo, nowTo };
}
