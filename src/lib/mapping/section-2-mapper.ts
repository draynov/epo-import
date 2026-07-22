/**
 * Mapping service for Section 2: Education and Qualifications
 * Maps parsed HTML data to Section 2 structure
 */

import { ParsedHTMLData } from '@/lib/parsers/html-parser';
import { SECTION_2_EDUCATION } from '@/config/sections/section-2-education';

export interface FieldMapping {
  targetField: string; // Key in Section 2
  targetLabel: string; // Label in Section 2
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

export interface Section2Mapping {
  fields: FieldMapping[];
  records: RecordMapping[];
}

/**
 * Map parsed HTML data to Section 2 structure
 */
export function mapToSection2(parsedData: ParsedHTMLData): Section2Mapping {
  const fields: FieldMapping[] = [];
  const records: RecordMapping[] = [];

  // Map education records (Образование и специалности)
  const educationSection = parsedData.sections.find(
    s => s.title?.toLowerCase().includes('образование') || 
         s.title?.toLowerCase().includes('квалификация') ||
         s.title?.toLowerCase().includes('обучение')
  );

  if (educationSection && educationSection.tables.length > 0) {
    const table = educationSection.tables[0];
    
    const mappedRecords = table.rows.map(row => {
      // Extract period (e.g., "2015-2020" or "09/2015 - 06/2020")
      const period = row['Период'] || row['період'] || row['Време'] || '';
      const { monthFrom, yearFrom, monthTo, yearTo, nowTo } = parsePeriod(period);

      // Extract type (e.g., "Бакалавър", "Магистър", "Средно образование")
      let educationType = row['Тип'] || row['тип'] || row['Образование'] || row['образование'] || '';
      
      // Extract institution name
      let institution = row['Институция'] || row['институция'] || 
                        row['Учебно заведение'] || row['учебно заведение'] ||
                        row['Заглавие'] || row['заглавие'] || '';

      // Extract specialty
      let specialty = row['Специалност'] || row['специалност'] || 
                      row['Описание'] || row['описание'] || '';

      // If institution is in title and specialty is in description, split
      if (!institution && specialty) {
        const parts = specialty.split(/\s+-\s+/);
        if (parts.length >= 2) {
          institution = parts[0].trim();
          specialty = parts.slice(1).join(' - ').trim();
        }
      }

      // Map education type text to numeric ID
      const typeId = mapEducationType(educationType);

      return {
        mesec_from: monthFrom,
        godina_from: yearFrom,
        now_to: nowTo ? 'true' : '',
        mesec_to: monthTo,
        godina_to: yearTo,
        type: typeId,
        institution: institution,
        specialty: specialty,
      };
    });

    records.push({
      targetSubsection: 'education',
      targetLabel: 'Образование и специалности',
      records: mappedRecords,
      sourceTable: educationSection.title || 'Образование',
      confidence: 'high',
    });
  }

  // Map specialties (Специалности и педагогическа правоспособност)
  // This is a direct_fields subsection with specialty, teacher, specialty2, teacher2, etc.
  // For now, we can extract first 1-2 specialties from education records if available
  const educationRecords = records.find(r => r.targetSubsection === 'education')?.records || [];
  
  if (educationRecords.length > 0) {
    // Extract up to 5 specialties
    educationRecords.slice(0, 5).forEach((record, index) => {
      const suffix = index === 0 ? '' : (index + 1).toString();
      
      if (record.specialty) {
        fields.push({
          targetField: `specialty${suffix}`,
          targetLabel: `Специалност ${index + 1}`,
          sourceValue: record.specialty,
          sourceLabel: 'Специалност (от образование)',
          confidence: 'medium',
          subsectionId: 'specialties',
          subsectionTitle: 'Специалности и педагогическа правоспособност',
        });
      }
    });
  }

  return { fields, records };
}

/**
 * Parse period string into month/year from/to
 * Examples: "2015-2020", "09/2015 - 06/2020", "2015 - До момента"
 */
function parsePeriod(period: string): { 
  monthFrom: string; 
  yearFrom: string; 
  monthTo: string; 
  yearTo: string; 
  nowTo: boolean;
} {
  let monthFrom = '0';
  let yearFrom = '';
  let monthTo = '0';
  let yearTo = '';
  let nowTo = false;

  if (!period) {
    return { monthFrom, yearFrom, monthTo, yearTo, nowTo };
  }

  // Check if "до момента" or similar
  if (period.toLowerCase().includes('момента') || 
      period.toLowerCase().includes('сега') ||
      period.toLowerCase().includes('настояще') ||
      period.toLowerCase().includes('present')) {
    nowTo = true;
  }

  // Extract dates using regex - try to find month/year patterns
  // Pattern: MM/YYYY or MM.YYYY or YYYY
  const datePattern = /(\d{1,2})[\/\.](\d{4})|(\d{4})/g;
  const matches = Array.from(period.matchAll(datePattern));

  if (matches.length >= 1) {
    const firstMatch = matches[0];
    if (firstMatch[1] && firstMatch[2]) {
      // MM/YYYY format
      monthFrom = firstMatch[1].padStart(2, '0');
      yearFrom = firstMatch[2];
    } else if (firstMatch[3]) {
      // YYYY format only
      monthFrom = '0';
      yearFrom = firstMatch[3];
    }

    if (matches.length >= 2 && !nowTo) {
      const secondMatch = matches[1];
      if (secondMatch[1] && secondMatch[2]) {
        // MM/YYYY format
        monthTo = secondMatch[1].padStart(2, '0');
        yearTo = secondMatch[2];
      } else if (secondMatch[3]) {
        // YYYY format only
        monthTo = '0';
        yearTo = secondMatch[3];
      }
    }
  }

  return { monthFrom, yearFrom, monthTo, yearTo, nowTo };
}

/**
 * Map education type text to numeric ID
 * Based on EDUCATION_TYPES from field-options.ts
 */
function mapEducationType(typeText: string): string {
  const lowerType = typeText.toLowerCase().trim();

  // Map common education types
  if (lowerType.includes('средно') || lowerType.includes('гимназия')) {
    return '1'; // Средно образование
  }
  if (lowerType.includes('професионален бакалавър') || lowerType.includes('проф') && lowerType.includes('бакалавър')) {
    return '2'; // Професионален бакалавър
  }
  if (lowerType.includes('бакалавър') || lowerType.includes('bachelor')) {
    return '3'; // Бакалавър
  }
  if (lowerType.includes('магистър') || lowerType.includes('master')) {
    return '4'; // Магистър
  }
  if (lowerType.includes('доктор') || lowerType.includes('phd') || lowerType.includes('doctorate')) {
    return '5'; // Доктор
  }
  if (lowerType.includes('специалист')) {
    return '6'; // Специалист
  }

  // Default to empty (user can select manually)
  return '';
}
