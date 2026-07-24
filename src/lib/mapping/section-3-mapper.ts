/**
 * Mapping service for Section 3: Practical Application
 * Maps parsed HTML data to Section 3 structure (Classes, Groups, Competences, Methods, Philosophy, Best Practices)
 */

import { ParsedHTMLData } from '@/lib/parsers/html-parser';
import { FieldMapping, RecordMapping } from './section-1-mapper';

export interface Section3Mapping {
  fields: FieldMapping[];
  records: RecordMapping[];
}

/**
 * Map parsed HTML data to Section 3 structure
 */
export function mapToSection3(parsedData: ParsedHTMLData): Section3Mapping {
  const fields: FieldMapping[] = [];
  const records: RecordMapping[] = [];
  
  let foundPhilosophy = false;
  let foundMethods = false;
  let foundClasses = false;
  let foundGroups = false;

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
      continue;
    }

    // Map classes (Класове/Групи or Учебни предмети)
    if (!foundClasses && (
      label.includes('класов') || 
      label.includes('клас') ||
      label.includes('учебни предмети') ||
      label.includes('предмет')
    )) {
      // Parse the text to extract subject and class information
      // Value format examples:
      // "Предучилищна група"
      // "Всички образователни направления"
      // "Математика - 5 клас"
      
      const lines = value.split(/[\n,]/).map(l => l.trim()).filter(l => l.length > 0);
      
      for (const line of lines) {
        // Try to parse format: "Subject - Class"
        const match = line.match(/^(.+?)\s*[-–]\s*(.+)$/);
        
        if (match) {
          // Found format with subject and class
          records.push({
            subsectionId: 'classes',
            subsectionTitle: 'Учебни предмети и класове',
            sourceLabel: textField.label,
            confidence: 'medium',
            fields: [
              {
                targetField: 'name',
                targetLabel: 'Наименование на предмета',
                sourceValue: match[1].trim(),
                confidence: 'medium',
              },
              {
                targetField: 'class',
                targetLabel: 'Класове',
                sourceValue: match[2].trim(),
                confidence: 'low',
                note: 'Моля, проверете и коригирайте класа/класовете',
              },
            ],
          });
        } else {
          // Single value - add as subject name with unspecified class
          records.push({
            subsectionId: 'classes',
            subsectionTitle: 'Учебни предмети и класове',
            sourceLabel: textField.label,
            confidence: 'low',
            fields: [
              {
                targetField: 'name',
                targetLabel: 'Наименование на предмета',
                sourceValue: line,
                confidence: 'medium',
              },
            ],
          });
        }
      }
      
      foundClasses = true;
      continue;
    }

    // Map groups (Класове/Групи)
    if (!foundGroups && (
      label.includes('групи') || 
      label.includes('група')
    )) {
      // Parse the text to extract group information
      // Value format examples:
      // "Предучилищна група"
      // "Яслена група - Звездички"
      
      const lines = value.split(/[\n,]/).map(l => l.trim()).filter(l => l.length > 0);
      
      for (const line of lines) {
        // Try to parse format: "Group Type - Group Name"
        const match = line.match(/^(.+?)\s*[-–]\s*(.+)$/);
        
        if (match) {
          // Found format with group type and name
          records.push({
            subsectionId: 'groups',
            subsectionTitle: 'Групи',
            sourceLabel: textField.label,
            confidence: 'medium',
            fields: [
              {
                targetField: 'group',
                targetLabel: 'Групи',
                sourceValue: match[1].trim(),
                confidence: 'low',
                note: 'Моля, изберете правилния тип група',
              },
              {
                targetField: 'name',
                targetLabel: 'Име на групата',
                sourceValue: match[2].trim(),
                confidence: 'high',
              },
            ],
          });
        } else {
          // Single value - treat as group type or name
          let groupValue = '';
          let nameValue = line;
          
          // Try to detect group type
          const lineLower = line.toLowerCase();
          if (lineLower.includes('предучилищна') || lineLower.includes('подготвителна')) {
            groupValue = '4'; // Предучилищна възраст (5-6/7 год.)
          } else if (lineLower.includes('втора млад')) {
            groupValue = '2'; // Втора младша (2-3 год.)
          } else if (lineLower.includes('първа млад')) {
            groupValue = '1'; // Първа младша (1-2 год.)
          } else if (lineLower.includes('средна')) {
            groupValue = '3'; // Средна възраст (3-4 год.)
          } else if (lineLower.includes('ясл')) {
            groupValue = '0'; // Яслена (0-1 год.)
          }
          
          records.push({
            subsectionId: 'groups',
            subsectionTitle: 'Групи',
            sourceLabel: textField.label,
            confidence: groupValue ? 'medium' : 'low',
            fields: [
              ...(groupValue ? [{
                targetField: 'group',
                targetLabel: 'Групи',
                sourceValue: groupValue,
                confidence: 'medium' as const,
              }] : []),
              {
                targetField: 'name',
                targetLabel: 'Име на групата',
                sourceValue: nameValue,
                confidence: 'high',
              },
            ],
          });
        }
      }
      
      foundGroups = true;
      continue;
    }
  }

  return { fields, records };
}
