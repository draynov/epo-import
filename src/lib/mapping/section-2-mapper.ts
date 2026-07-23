/**
 * Mapping service for Section 2: Education and Qualifications
 * Maps parsed HTML data to Section 2 structure
 */

import { ParsedHTMLData } from '@/lib/parsers/html-parser';
import { SECTION_2_EDUCATION } from '@/config/sections/section-2-education';
import { FieldMapping, RecordMapping } from './section-1-mapper';

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

      // Try to extract type, institution, and specialty intelligently
      let educationType = row['Тип'] || row['тип'] || row['Образование'] || row['образование'] || '';
      let institution = row['Институция'] || row['институция'] || 
                        row['Учебно заведение'] || row['учебно заведение'] ||
                        row['Университет'] || row['университет'] || '';
      let specialty = row['Специалност'] || row['специалност'] || 
                      row['Област'] || row['област'] ||
                      row['Квалификация'] || row['квалификация'] ||
                      row['Професия'] || row['професия'] || '';

      // Check if "Заглавие" contains education type keywords
      const titleField = row['Заглавие'] || row['заглавие'] || '';
      const descriptionField = row['Описание'] || row['описание'] || '';
      
      // Education type keywords (case insensitive)
      const educationTypeKeywords = [
        'основно', 'средно', 'бакалавър', 'магистър', 'доктор',
        'професионален', 'специалист', 'образование', 'квалификация'
      ];
      
      const titleLower = titleField.toLowerCase();
      const isTitleEducationType = educationTypeKeywords.some(keyword => titleLower.includes(keyword));
      
      if (isTitleEducationType && titleField && descriptionField) {
        // Title is education type, Description contains institution + specialty on separate lines
        educationType = educationType || titleField;
        
        // Split description by newlines to extract institution and specialty
        const descriptionLines = descriptionField
          .split(/\n+/)
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        institution = institution || descriptionLines[0] || '';
        specialty = specialty || descriptionLines[1] || '';
      } else if (titleField && descriptionField) {
        // Standard case: Title is institution, Description is specialty
        institution = institution || titleField;
        specialty = specialty || descriptionField;
      } else if (titleField) {
        // Only title available
        institution = institution || titleField;
      } else if (descriptionField) {
        // Only description available
        institution = institution || descriptionField;
      }

      // If institution is in title and specialty is in description, split
      if (!institution && specialty) {
        const parts = specialty.split(/\s+-\s+/);
        if (parts.length >= 2) {
          institution = parts[0].trim();
          specialty = parts.slice(1).join(' - ').trim();
        }
      }

      // If specialty is still empty, try to extract from combined field
      if (!specialty && institution && institution.includes('-')) {
        const parts = institution.split(/\s+-\s+/);
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
  // Extract specialties and institutions from education records
  const educationRecords = records.find(r => r.targetSubsection === 'education')?.records || [];
  
  if (educationRecords.length > 0) {
    // Filter records that have specialty, then map to first available fields
    const recordsWithSpecialty = educationRecords.filter(record => record.specialty);
    
    recordsWithSpecialty.slice(0, 5).forEach((record, index) => {
      const suffix = index === 0 ? '' : (index + 1).toString();
      
      fields.push({
        targetField: `specialty${suffix}`,
        targetLabel: `Специалност ${index + 1}`,
        sourceValue: record.specialty,
        sourceLabel: 'Специалност (от образование)',
        confidence: 'medium',
        subsectionId: 'specialties',
        subsectionTitle: 'Специалности и педагогическа правоспособност',
      });
    });
    
    // Also map institutions to first available fields
    const recordsWithInstitution = educationRecords.filter(record => record.institution);
    
    recordsWithInstitution.slice(0, 5).forEach((record, index) => {
      const suffix = index === 0 ? '' : (index + 1).toString();
      
      fields.push({
        targetField: `institution${suffix}`,
        targetLabel: `Обучителна институция ${index + 1}`,
        sourceValue: record.institution,
        sourceLabel: 'Институция (от образование)',
        confidence: 'medium',
        subsectionId: 'specialties',
        subsectionTitle: 'Специалности и педагогическа правоспособност',
      });
    });
  }

  // Map qualifications and trainings (Квалификации и обучения)
  // This section distributes records to 3 subsections based on content:
  // 1. Credits (credits) - if last line contains "квалификационен кредит" or "кредита"
  // 2. Internal qualifications (internal-qualifications) - if no institution (only 1 line)
  // 3. Other qualifications (other-qualifications) - all others (2+ lines, no credits)
  const qualificationsSection = parsedData.sections.find(
    s => s.title?.toLowerCase().includes('квалификации') && 
         s.title?.toLowerCase().includes('обучения')
  );

  if (qualificationsSection && qualificationsSection.tables.length > 0) {
    const table = qualificationsSection.tables[0];
    
    const creditsRecords: any[] = [];
    const internalRecords: any[] = [];
    const otherRecords: any[] = [];
    
    table.rows.forEach((row, rowIndex) => {
      // Extract date from title (e.g., "12/07/2024 - Удостоверение")
      const titleField = row['Заглавие'] || row['заглавие'] || '';
      const descriptionField = row['Описание'] || row['описание'] || '';
      
      console.log(`\n🔍 === PROCESSING ROW ${rowIndex + 1} ===`);
      console.log('📄 RAW DESCRIPTION:', JSON.stringify(descriptionField));
      
      // Split description by lines and clean thoroughly
      const descriptionLines = descriptionField
        .split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      console.log('📋 SPLIT INTO LINES:', descriptionLines);
      console.log('📊 LINE COUNT:', descriptionLines.length);
      
      // Line 0: Theme/Name (with quotes removed)
      const theme = descriptionLines[0]?.replace(/^[""]|[""]$/g, '').trim() || '';
      
      // Extract date and type from title
      const { month, year, type } = parseQualificationTitle(titleField);
      
      // Check all lines for credits (comprehensive detection)
      console.log('🔎 Checking each line for credits...');
      const hasCreditsInDescription = descriptionLines.some((line, lineIndex) => {
        const lowerLine = line.toLowerCase().trim();
        console.log(`  Line ${lineIndex}: "${line}"`);
        console.log(`  Lowercase: "${lowerLine}"`);
        
        // Multiple detection methods for maximum coverage
        const hasKeyword = lowerLine.includes('кредит');
        const hasPattern = /\d+\s*(?:квалификационен|квалификационні|кредит|кредита)/i.test(lowerLine);
        
        console.log(`  Has keyword 'кредит': ${hasKeyword}`);
        console.log(`  Matches pattern: ${hasPattern}`);
        
        if (hasKeyword || hasPattern) {
          console.log('  ✅ CREDITS DETECTED in this line!');
          return true;
        }
        console.log(`  ❌ No credits detected in this line`);
        return false;
      });
      
      const decision = hasCreditsInDescription ? 'CREDITS' : (descriptionLines.length === 1 ? 'INTERNAL' : 'OTHER');
      console.log(`\n🎯 FINAL DECISION: ${decision}`);
      console.log(`   Has credits: ${hasCreditsInDescription}`);
      console.log(`   Line count: ${descriptionLines.length}`);
      
      if (hasCreditsInDescription) {
        // Credits subsection (3 lines: theme, institution, credits)
        // Find the line with credits to extract quantity
        const creditLine = descriptionLines.find(line => 
          line.toLowerCase().includes('кредит')
        ) || '';
        
        const quantityMatch = creditLine.match(/(\d+)\s*(?:квалификационен\s*кредит|кредита)/i);
        const quantity = quantityMatch ? quantityMatch[1] : '1';
        
        // Institution is typically the line before the credits line (or line 1 if 3 lines)
        const institution = descriptionLines.length >= 2 
          ? descriptionLines[descriptionLines.length - 2] 
          : '';
        
        creditsRecords.push({
          mesec: month,
          godina: year,
          duration: '1', // Default to '1' (can be adjusted)
          quantity: quantity,
          institution: institution,
          tema: theme,
        });
      } else if (descriptionLines.length === 1) {
        // Internal qualifications (only 1 line: theme, no institution)
        internalRecords.push({
          mesec_from: month,
          godina_from: year,
          mesec_to: '0',
          godina_to: '0',
          now_to: 'false',
          name: theme,
          hours: '0', // Default, can be extracted if present
          institution: '', // No institution for internal
        });
      } else {
        // Other qualifications (2 lines: theme, institution, no credits)
        const institution = descriptionLines[1] || '';
        
        // Map type text to numeric ID (default to 0 if not found)
        const typeId = mapQualificationType(type);
        
        otherRecords.push({
          mesec_from: month,
          godina_from: year,
          mesec_to: '0',
          godina_to: '0',
          now_to: 'false',
          type: typeId,
          name: theme,
          institution: institution,
        });
      }
    });
    
    // Add credits records if any
    if (creditsRecords.length > 0) {
      records.push({
        targetSubsection: 'credits',
        targetLabel: 'Квалификационни кредити',
        records: creditsRecords,
        sourceTable: qualificationsSection.title || 'Квалификации и обучения',
        confidence: 'high',
      });
    }
    
    // Add internal qualifications records if any
    if (internalRecords.length > 0) {
      records.push({
        targetSubsection: 'internal-qualifications',
        targetLabel: 'Вътрешни квалификации',
        records: internalRecords,
        sourceTable: qualificationsSection.title || 'Квалификации и обучения',
        confidence: 'high',
      });
    }
    
    // Add other qualifications records if any
    if (otherRecords.length > 0) {
      records.push({
        targetSubsection: 'other-qualifications',
        targetLabel: 'Други квалификации',
        records: otherRecords,
        sourceTable: qualificationsSection.title || 'Квалификации и обучения',
        confidence: 'high',
      });
    }
  }

  return { fields, records };
}

/**
 * Map qualification type text to numeric ID
 * Based on qualification types from EPO API
 * 0: Професионална квалификация, 1: Квалификационен курс, 2: Семинар, 
 * 3: Конференция, 4: Обучителен курс, 5: Специализация, 
 * 6: Удостоверение, 7: Педагогическа правоспособност, 8: Сертификат, 9: Уебинар
 */
function mapQualificationType(typeText: string): string {
  const lowerType = typeText.toLowerCase().trim();

  // Map common qualification types
  if (lowerType.includes('професионална') && lowerType.includes('квалификация')) {
    return '0'; // Професионална квалификация
  }
  if (lowerType.includes('квалификационен') && lowerType.includes('курс')) {
    return '1'; // Квалификационен курс
  }
  if (lowerType.includes('семинар')) {
    return '2'; // Семинар
  }
  if (lowerType.includes('конференция')) {
    return '3'; // Конференция
  }
  if (lowerType.includes('обучителен') && lowerType.includes('курс')) {
    return '4'; // Обучителен курс
  }
  if (lowerType.includes('специализация')) {
    return '5'; // Специализация
  }
  if (lowerType.includes('удостоверение')) {
    return '6'; // Удостоверение
  }
  if (lowerType.includes('педагогическа') && lowerType.includes('правоспособност')) {
    return '7'; // Педагогическа правоспособност
  }
  if (lowerType.includes('сертификат')) {
    return '8'; // Сертификат
  }
  if (lowerType.includes('уебинар') || lowerType.includes('webinar')) {
    return '9'; // Уебинар
  }

  // Default to удостоверение (6) if not found
  return '6';
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
 * Parse qualification title to extract date and type
 * Example: "12/07/2024 - Удостоверение" → { month: '7', year: '2024', type: 'Удостоверение' }
 */
function parseQualificationTitle(title: string): { month: string; year: string; type: string } {
  let month = '0';
  let year = '';
  let type = '';
  
  if (!title) {
    return { month, year, type };
  }
  
  // Try to extract date (DD/MM/YYYY format)
  const dateMatch = title.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dateMatch) {
    month = dateMatch[2]; // MM
    year = dateMatch[3];  // YYYY
    
    // Extract type after the dash
    const typePart = title.split('-').slice(1).join('-').trim();
    type = typePart || '';
  }
  
  return { month, year, type };
}

/**
 * Map education type text to numeric ID
 * Based on EDUCATION_TYPES from field-options.ts
 * 0: Начално, 1: Основно, 2: Средно, 3: Полувисше, 
 * 4: Висше - бакалавър, 5: Висше - магистър, 6: ОНС Доктор, 7: Доктор на науките
 */
function mapEducationType(typeText: string): string {
  const lowerType = typeText.toLowerCase().trim();

  // Map common education types
  if (lowerType.includes('начално')) {
    return '0'; // Начално образование
  }
  if (lowerType.includes('основно')) {
    return '1'; // Основно образование
  }
  if (lowerType.includes('средно') || lowerType.includes('гимназия')) {
    return '2'; // Средно образование
  }
  if (lowerType.includes('полувисше')) {
    return '3'; // Полувисше образование
  }
  if (lowerType.includes('бакалавър') || lowerType.includes('bachelor')) {
    return '4'; // Висше - бакалавър
  }
  if (lowerType.includes('магистър') || lowerType.includes('master')) {
    return '5'; // Висше - магистър
  }
  if (lowerType.includes('онс') && lowerType.includes('доктор')) {
    return '6'; // ОНС Доктор
  }
  if (lowerType.includes('доктор') || lowerType.includes('phd') || lowerType.includes('doctorate')) {
    return '7'; // Доктор на науките
  }

  // Default to empty (user can select manually)
  return '';
}
