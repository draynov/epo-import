/**
 * HTML Parser for extracting structured data from portfolio HTML files
 */

export interface ParsedTable {
  title?: string;
  headers: string[];
  rows: Record<string, string>[];
}

export interface ParsedTextField {
  label: string;
  value: string;
}

export interface ParsedSection {
  title?: string;
  textFields: ParsedTextField[];
  tables: ParsedTable[];
  lists: string[];
}

export interface ParsedHTMLData {
  sections: ParsedSection[];
  rawTables: ParsedTable[];
  rawTextFields: ParsedTextField[];
  rawLists: string[];
}

/**
 * Parse HTML content and extract structured data
 */
export function parseHTMLContent(htmlContent: string): ParsedHTMLData {
  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const sections: ParsedSection[] = [];
  const rawTables: ParsedTable[] = [];
  const rawTextFields: ParsedTextField[] = [];
  const rawLists: string[] = [];

  // Extract all tables
  const tables = doc.querySelectorAll('table');
  tables.forEach((table) => {
    const parsedTable = parseTable(table);
    if (parsedTable.rows.length > 0) {
      rawTables.push(parsedTable);
    }
  });

  // Extract text fields (looking for common patterns like dt/dd, label/value, etc.)
  extractTextFields(doc, rawTextFields);

  // Extract lists
  const lists = doc.querySelectorAll('ul, ol');
  lists.forEach((list) => {
    const items = Array.from(list.querySelectorAll('li')).map(li => li.textContent?.trim() || '');
    if (items.length > 0 && items.some(item => item.length > 0)) {
      rawLists.push(...items);
    }
  });

  // Try to identify sections based on headings
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length > 0) {
    headings.forEach((heading) => {
      const section: ParsedSection = {
        title: heading.textContent?.trim(),
        textFields: [],
        tables: [],
        lists: [],
      };
      
      // Try to find content between this heading and the next
      let currentElement = heading.nextElementSibling;
      while (currentElement && !currentElement.matches('h1, h2, h3, h4, h5, h6')) {
        if (currentElement.matches('table')) {
          const table = parseTable(currentElement as HTMLTableElement);
          if (table.rows.length > 0) {
            section.tables.push(table);
          }
        }
        currentElement = currentElement.nextElementSibling;
      }

      if (section.tables.length > 0 || section.textFields.length > 0 || section.lists.length > 0) {
        sections.push(section);
      }
    });
  }

  return {
    sections: sections.length > 0 ? sections : [{
      title: 'Данни',
      textFields: rawTextFields,
      tables: rawTables,
      lists: rawLists,
    }],
    rawTables,
    rawTextFields,
    rawLists,
  };
}

/**
 * Parse a table element into structured data
 */
function parseTable(table: HTMLTableElement): ParsedTable {
  const headers: string[] = [];
  const rows: Record<string, string>[] = [];

  // Try to find table caption/title
  const caption = table.querySelector('caption');
  const title = caption?.textContent?.trim();

  // Extract headers
  const headerCells = table.querySelectorAll('thead th, thead td, tr:first-child th');
  if (headerCells.length > 0) {
    headerCells.forEach((cell) => {
      headers.push(cell.textContent?.trim() || '');
    });
  }

  // If no headers found, check first row
  if (headers.length === 0) {
    const firstRow = table.querySelector('tbody tr, tr');
    if (firstRow) {
      const cells = firstRow.querySelectorAll('td, th');
      // If all cells are bold or have distinct styling, treat as header
      const allBold = Array.from(cells).every(cell => {
        const style = window.getComputedStyle(cell);
        return style.fontWeight === 'bold' || style.fontWeight === '700' || cell.tagName === 'TH';
      });

      if (allBold && cells.length > 0) {
        cells.forEach((cell) => {
          headers.push(cell.textContent?.trim() || '');
        });
      }
    }
  }

  // Extract rows
  const bodyRows = table.querySelectorAll('tbody tr, tr');
  bodyRows.forEach((row, index) => {
    // Skip first row if it was used as header
    if (index === 0 && headers.length > 0) {
      const firstRowCells = row.querySelectorAll('th');
      if (firstRowCells.length > 0) return; // Skip header row
    }

    const cells = row.querySelectorAll('td, th');
    if (cells.length === 0) return;

    const rowData: Record<string, string> = {};
    cells.forEach((cell, cellIndex) => {
      const key = headers[cellIndex] || `column_${cellIndex + 1}`;
      rowData[key] = cell.textContent?.trim() || '';
    });

    // Only add row if it has some non-empty data
    if (Object.values(rowData).some(val => val.length > 0)) {
      rows.push(rowData);
    }
  });

  return {
    title,
    headers: headers.length > 0 ? headers : Object.keys(rows[0] || {}),
    rows,
  };
}

/**
 * Extract text fields from common patterns (dt/dd, div pairs, etc.)
 */
function extractTextFields(doc: Document, fields: ParsedTextField[]): void {
  // Pattern 1: Definition lists (dt/dd)
  const dls = doc.querySelectorAll('dl');
  dls.forEach((dl) => {
    const dts = dl.querySelectorAll('dt');
    const dds = dl.querySelectorAll('dd');
    dts.forEach((dt, index) => {
      const dd = dds[index];
      if (dd) {
        const label = dt.textContent?.trim() || '';
        const value = dd.textContent?.trim() || '';
        if (label && value) {
          fields.push({ label, value });
        }
      }
    });
  });

  // Pattern 2: Label + input/span pairs
  const labels = doc.querySelectorAll('label');
  labels.forEach((label) => {
    const forAttr = label.getAttribute('for');
    const labelText = label.textContent?.trim() || '';
    
    if (forAttr) {
      const input = doc.getElementById(forAttr);
      if (input) {
        const value = input.getAttribute('value') || input.textContent?.trim() || '';
        if (labelText && value) {
          fields.push({ label: labelText, value });
        }
      }
    } else {
      // Check for adjacent input/span
      const next = label.nextElementSibling;
      if (next && (next.tagName === 'INPUT' || next.tagName === 'SPAN' || next.tagName === 'DIV')) {
        const value = next.getAttribute('value') || next.textContent?.trim() || '';
        if (labelText && value) {
          fields.push({ label: labelText, value });
        }
      }
    }
  });

  // Pattern 3: Divs with class/id containing "field", "label", "value" etc.
  const fieldDivs = doc.querySelectorAll('[class*="field"], [class*="row"], [class*="item"]');
  fieldDivs.forEach((div) => {
    const labelEl = div.querySelector('[class*="label"], strong, b');
    const valueEl = div.querySelector('[class*="value"], span:not([class*="label"])');
    
    if (labelEl && valueEl) {
      const label = labelEl.textContent?.trim() || '';
      const value = valueEl.textContent?.trim() || '';
      if (label && value && !fields.some(f => f.label === label && f.value === value)) {
        fields.push({ label, value });
      }
    }
  });
}

/**
 * Clean and normalize field name for matching
 */
export function normalizeFieldName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, '') // Remove special chars but keep unicode letters
    .replace(/\s+/g, '_');
}
