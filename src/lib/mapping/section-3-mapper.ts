/**
 * Mapping service for Section 3: Practical Application
 * Maps parsed HTML data to Section 3 structure (Teaching Methods and Philosophy)
 */

import { ParsedHTMLData } from '@/lib/parsers/html-parser';
import { FieldMapping, RecordMapping } from './section-1-mapper';

export interface Section3Mapping {
  fields: FieldMapping[];
  records: RecordMapping[]; // Section 3 has no record lists, only direct fields
}

/**
 * Map parsed HTML data to Section 3 structure
 */
export function mapToSection3(parsedData: ParsedHTMLData): Section3Mapping {
  const fields: FieldMapping[] = [];
  let foundPhilosophy = false;
  let foundMethods = false;

  // Look for text fields in rawTextFields (includes all fields from all sections)
  for (const textField of parsedData.rawTextFields) {
    const label = textField.label.toLowerCase();
    const value = textField.value;

    // Map teaching philosophy (only once)
    if (!foundPhilosophy && (label.includes('философи') || label.includes('philosophy'))) {
      fields.push({
        targetField: 'teachingphilosophy',
        targetLabel: 'Философия на преподаване',
        sourceValue: value,
        sourceLabel: textField.label,
        confidence: 'high',
        subsectionId: 'teaching-philosophy',
        subsectionTitle: 'Философия на преподаване',
      });
      foundPhilosophy = true;
      continue;
    }

    // Map teaching methods (only once)
    if (!foundMethods && (label.includes('метод') || label.includes('method'))) {
      fields.push({
        targetField: 'teachingmethods',
        targetLabel: 'Методи на преподаване',
        sourceValue: value,
        sourceLabel: textField.label,
        confidence: 'high',
        subsectionId: 'teaching-methods',
        subsectionTitle: 'Методи на преподаване',
      });
      foundMethods = true;
    }

    // Stop if we found both fields
    if (foundPhilosophy && foundMethods) {
      break;
    }
  }

  return { fields, records: [] };
}
