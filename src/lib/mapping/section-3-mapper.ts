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

  // Look for text fields that might contain teaching methods or philosophy
  for (const textField of parsedData.rawTextFields) {
    const label = textField.label.toLowerCase();
    const value = textField.value;

    // Map teaching philosophy FIRST (more specific check)
    if (
      label.includes('философи') ||
      label.includes('philosophy')
    ) {
      fields.push({
        targetField: 'teachingphilosophy',
        targetLabel: 'Философия на преподаване',
        sourceValue: value,
        sourceLabel: textField.label,
        confidence: 'high',
        subsectionId: 'teaching-philosophy',
        subsectionTitle: 'Философия на преподаване',
      });
      continue; // Skip to next field
    }

    // Map teaching methods (check after philosophy)
    if (
      label.includes('метод') ||
      label.includes('method')
    ) {
      fields.push({
        targetField: 'teachingmethods',
        targetLabel: 'Методи на преподаване',
        sourceValue: value,
        sourceLabel: textField.label,
        confidence: 'high',
        subsectionId: 'teaching-methods',
        subsectionTitle: 'Методи на преподаване',
      });
    }
  }

  // Also check sections for "Информация" section
  const infoSection = parsedData.sections.find(
    s => s.title?.toLowerCase().includes('информация') ||
         s.title?.toLowerCase().includes('information')
  );

  if (infoSection) {
    for (const textField of infoSection.textFields) {
      const label = textField.label.toLowerCase();
      const value = textField.value;

      // Map teaching philosophy from info section FIRST (more specific)
      if (
        label.includes('философи') ||
        label.includes('philosophy')
      ) {
        // Check if not already added
        const exists = fields.some(
          f => f.targetField === 'teachingphilosophy' && f.sourceValue === value
        );
        if (!exists) {
          fields.push({
            targetField: 'teachingphilosophy',
            targetLabel: 'Философия на преподаване',
            sourceValue: value,
            sourceLabel: textField.label,
            confidence: 'high',
            subsectionId: 'teaching-philosophy',
            subsectionTitle: 'Философия на преподаване',
          });
        }
        continue; // Skip to next field
      }

      // Map teaching methods from info section
      if (
        label.includes('метод') ||
        label.includes('method')
      ) {
        // Check if not already added
        const exists = fields.some(
          f => f.targetField === 'teachingmethods' && f.sourceValue === value
        );
        if (!exists) {
          fields.push({
            targetField: 'teachingmethods',
            targetLabel: 'Методи на преподаване',
            sourceValue: value,
            sourceLabel: textField.label,
            confidence: 'high',
            subsectionId: 'teaching-methods',
            subsectionTitle: 'Методи на преподаване',
          });
        }
      }
    }
  }

  return { fields, records: [] };
}
