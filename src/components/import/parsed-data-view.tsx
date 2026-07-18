/**
 * Component for displaying parsed HTML data in a structured way
 */

import { ParsedHTMLData, ParsedTable, ParsedTextField } from '@/lib/parsers/html-parser';

interface ParsedDataViewProps {
  data: ParsedHTMLData;
}

export function ParsedDataView({ data }: ParsedDataViewProps) {
  const { sections, rawTables, rawTextFields, rawLists } = data;

  return (
    <div className="space-y-6">
      {/* Sections */}
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
          {section.title && (
            <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            </div>
          )}

          <div className="p-4 space-y-4">
            {/* Text Fields in Section */}
            {section.textFields.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Текстови полета:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {section.textFields.map((field, fieldIndex) => (
                    <TextFieldDisplay key={fieldIndex} field={field} />
                  ))}
                </div>
              </div>
            )}

            {/* Tables in Section */}
            {section.tables.map((table, tableIndex) => (
              <div key={tableIndex}>
                <TableDisplay table={table} />
              </div>
            ))}

            {/* Lists in Section */}
            {section.lists.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Списък:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {section.lists.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Raw Tables (if not in sections) */}
      {sections.length === 0 && rawTables.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Таблици:</h3>
          {rawTables.map((table, index) => (
            <TableDisplay key={index} table={table} />
          ))}
        </div>
      )}

      {/* Raw Text Fields (if not in sections) */}
      {sections.length === 0 && rawTextFields.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Текстови полета:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rawTextFields.map((field, index) => (
              <TextFieldDisplay key={index} field={field} />
            ))}
          </div>
        </div>
      )}

      {/* Raw Lists (if not in sections) */}
      {sections.length === 0 && rawLists.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Списъци:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {rawLists.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Display a single text field
 */
function TextFieldDisplay({ field }: { field: ParsedTextField }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
      <div className="text-xs font-medium text-gray-500 mb-1">{field.label}</div>
      <div className="text-sm text-gray-900">{field.value}</div>
    </div>
  );
}

/**
 * Display a table
 */
function TableDisplay({ table }: { table: ParsedTable }) {
  return (
    <div className="space-y-2">
      {table.title && (
        <h4 className="text-sm font-medium text-gray-700">{table.title}</h4>
      )}
      
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {table.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {table.headers.map((header, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-3 py-2 text-sm text-gray-900"
                  >
                    <div className="whitespace-pre-wrap break-words max-w-2xl">
                      {row[header] || '-'}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.rows.length > 0 && (
        <div className="text-xs text-gray-500">
          Общо редове: {table.rows.length}
        </div>
      )}
    </div>
  );
}
