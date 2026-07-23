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

    // Map teaching methods
    if (
      label.includes('метод') ||
      label.includes('method') ||
      label.includes('преподаван') ||
      label.includes('teaching')
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

    // Map teaching philosophy
    if (
      label.includes('философи') ||
      label.includes('philosophy') ||
      label.includes('подход') ||
      label.includes('approach') ||
      label.includes('принцип') ||
      label.includes('principle')
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

      // Map teaching methods from info section
      if (
        label.includes('метод') ||
        label.includes('method') ||
        label.includes('преподаван') ||
        label.includes('teaching')
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

      // Map teaching philosophy from info section
      if (
        label.includes('философи') ||
        label.includes('philosophy') ||
        label.includes('подход') ||
        label.includes('approach') ||
        label.includes('принцип') ||
        label.includes('principle')
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
      }
    }
  }

  return { fields, records: [] };
}
