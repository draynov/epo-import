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

  // Try to find main content area
  let contentRoot: Element | Document = doc;
  const mainContent = doc.querySelector('main, [role="main"], #content, .content, #main, .main');
  if (mainContent) {
    contentRoot = mainContent;
  }

  // Extract all tables from main content
  const tables = contentRoot.querySelectorAll('table');
  tables.forEach((table) => {
    // Skip tables in nav/header/footer
    if (table.closest('nav, header, footer, [class*="nav"], [class*="menu"]')) return;
    
    const parsedTable = parseTable(table);
    if (parsedTable.rows.length > 0) {
      rawTables.push(parsedTable);
    }
  });

  // Extract profile/intro information (common in portfolio sites)
  extractProfileInfo(contentRoot as Element, rawTextFields);

  // Extract text fields (looking for common patterns like dt/dd, label/value, etc.)
  extractTextFields(contentRoot as Element, rawTextFields);

  // Extract lists
  const lists = contentRoot.querySelectorAll('ul, ol');
  lists.forEach((list) => {
    // Skip navigation lists (common patterns)
    const parent = list.closest('nav, header, [class*="nav"], [class*="menu"], [id*="nav"], [id*="menu"]');
    if (parent) return; // Skip navigation menus
    
    // Skip if list is in header/footer
    if (list.closest('header, footer')) return;
    
    const items = Array.from(list.querySelectorAll('li')).map(li => li.textContent?.trim() || '');
    if (items.length > 0 && items.some(item => item.length > 0)) {
      // Skip common navigation patterns
      const isNavigation = items.some(item => 
        item.toLowerCase().includes('профил') ||
        item.toLowerCase().includes('форма') ||
        item.toLowerCase().includes('информация') ||
        (items.length < 10 && item.split(' ').length < 3) // Short menu items
      );
      
      if (!isNavigation) {
        rawLists.push(...items);
      }
    }
  });

  // Try to identify sections based on headings
  const headings = contentRoot.querySelectorAll('h1, h2, h3, h4, h5, h6');
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

  // Try to parse timeline/portfolio structure (like uchilishta.bg exports)
  const timelineSections = contentRoot.querySelectorAll('section.timeline, section[class*="timeline"]');
  if (timelineSections.length > 0) {
    timelineSections.forEach((timelineSection) => {
      const sectionTitle = timelineSection.querySelector('h2.section-title, h2')?.textContent?.trim() || 'Секция';
      
      // Extract timeline items
      const timelineItems = timelineSection.querySelectorAll('.line.row[class*="view_settings"]');
      
      if (timelineItems.length > 0) {
        const table: ParsedTable = {
          title: sectionTitle,
          headers: ['Заглавие', 'Период', 'Описание'],
          rows: [],
        };

        timelineItems.forEach((item) => {
          const title = item.querySelector('h3')?.textContent?.trim() || '';
          const time = item.querySelector('h4')?.textContent?.trim() || '';
          
          // Extract description - get all paragraphs and text content
          const descriptionContainer = item.querySelector('.job-description, .graduation-description, .line-content');
          let description = '';
          
          if (descriptionContainer) {
            // Get all text content, including nested paragraphs
            const paragraphs = descriptionContainer.querySelectorAll('p');
            if (paragraphs.length > 0) {
              description = Array.from(paragraphs)
                .map(p => p.textContent?.trim())
                .filter(text => text && text.length > 0)
                .join('\n\n');
            } else {
              // Fallback to full text content
              description = descriptionContainer.textContent?.trim() || '';
            }
          }
          
          // Fallback: if no description container, try to get any p tags in the item
          if (!description) {
            const allParagraphs = item.querySelectorAll('p');
            if (allParagraphs.length > 0) {
              description = Array.from(allParagraphs)
                .map(p => p.textContent?.trim())
                .filter(text => text && text.length > 0)
                .join('\n\n');
            }
          }
          
          if (title || time || description) {
            table.rows.push({
              'Заглавие': title,
              'Период': time,
              'Описание': description,
            });
          }
        });

        if (table.rows.length > 0) {
          const existingSection = sections.find(s => s.title === sectionTitle);
          if (existingSection) {
            existingSection.tables.push(table);
          } else {
            sections.push({
              title: sectionTitle,
              textFields: [],
              tables: [table],
              lists: [],
            });
          }
        }
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

/** * Extract profile/intro information (name, description, etc.)
 */
function extractProfileInfo(root: Element | Document, fields: ParsedTextField[]): void {
  // Pattern 1: Portfolio intro section with name
  const introName = root.querySelector('.intro-title1, h1.intro-title1, .profile-name, h1[class*="name"]');
  if (introName) {
    const fullName = introName.textContent?.trim();
    if (fullName) {
      fields.push({ label: 'Име', value: fullName });
    }
  }

  // Pattern 2: Side menu name (fallback)
  if (!introName) {
    const sideName = root.querySelector('.side-menu-name');
    if (sideName) {
      const fullName = sideName.textContent?.trim();
      if (fullName) {
        fields.push({ label: 'Име', value: fullName });
      }
    }
  }

  // Pattern 3: Job/position title
  const jobTitle = root.querySelector('.intro-title2, h2.intro-title2, .side-menu-job, [class*="job-title"]');
  if (jobTitle) {
    const job = jobTitle.textContent?.trim();
    if (job) {
      fields.push({ label: 'Длъжност', value: job });
    }
  }

  // Pattern 4: Description/bio
  const descriptions = root.querySelectorAll('.view_settings1, .profile-description, [class*="description"]');
  descriptions.forEach((desc) => {
    const text = desc.textContent?.trim();
    if (text && text.length > 20 && !text.includes('function') && !text.includes('script')) {
      // Only add if it looks like actual content
      fields.push({ label: 'Описание', value: text });
    }
  });

  // Pattern 5: Contact info, email, phone
  const contactPatterns = [
    { selector: '[class*="email"], [id*="email"]', label: 'Имейл' },
    { selector: '[class*="phone"], [id*="phone"], [class*="tel"]', label: 'Телефон' },
    { selector: '[class*="address"]', label: 'Адрес' },
  ];

  contactPatterns.forEach(({ selector, label }) => {
    const element = root.querySelector(selector);
    if (element) {
      const value = element.textContent?.trim() || element.getAttribute('value') || '';
      if (value && value.length > 2) {
        fields.push({ label, value });
      }
    }
  });
}

/** * Extract text fields from common patterns (dt/dd, div pairs, etc.)
 */
function extractTextFields(root: Element | Document, fields: ParsedTextField[]): void {
  // Pattern 1: Definition lists (dt/dd)
  const dls = root.querySelectorAll('dl');
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
  const labels = root.querySelectorAll('label');
  labels.forEach((label) => {
    const forAttr = label.getAttribute('for');
    const labelText = label.textContent?.trim() || '';
    
    if (forAttr) {
      const input = (root as Document).getElementById?.(forAttr) || (root as Element).querySelector(`#${forAttr}`);
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
  const fieldDivs = root.querySelectorAll('[class*="field"], [class*="row"], [class*="item"]');
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
