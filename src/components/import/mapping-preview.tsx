/**
 * Mapping Preview Component
 * Shows side-by-side comparison of expected fields (left) and extracted data (right)
 * Displays ALL fields from Section 1 config, even if no mapping exists
 */

'use client';

import { Section1Mapping, FieldMapping, RecordMapping } from '@/lib/mapping/section-1-mapper';
import { SECTION_1_GENERAL_INFO } from '@/config/sections/section-1-general';
import { useState } from 'react';

interface MappingPreviewProps {
  mapping: Section1Mapping;
  onConfirm: (selectedMappings: Section1Mapping) => void;
  onCancel: () => void;
}

export function MappingPreview({ mapping, onConfirm, onCancel }: MappingPreviewProps) {
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(mapping.fields.map(f => f.targetField))
  );
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set(mapping.records.map(r => r.targetSubsection))
  );

  const handleFieldToggle = (fieldKey: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldKey)) {
      newSelected.delete(fieldKey);
    } else {
      newSelected.add(fieldKey);
    }
    setSelectedFields(newSelected);
  };

  const handleRecordToggle = (subsectionId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(subsectionId)) {
      newSelected.delete(subsectionId);
    } else {
      newSelected.add(subsectionId);
    }
    setSelectedRecords(newSelected);
  };

  const handleConfirm = () => {
    const filteredMapping: Section1Mapping = {
      fields: mapping.fields.filter(f => selectedFields.has(f.targetField)),
      records: mapping.records.filter(r => selectedRecords.has(r.targetSubsection)),
    };
    onConfirm(filteredMapping);
  };

  // Create a map of existing mappings for quick lookup
  const fieldMappingMap = new Map<string, FieldMapping>();
  mapping.fields.forEach(f => fieldMappingMap.set(f.targetField, f));

  const recordMappingMap = new Map<string, RecordMapping>();
  mapping.records.forEach(r => recordMappingMap.set(r.targetSubsection, r));

  // Count total fields (all fields from config, not just mapped ones)
  let totalFieldsInConfig = 0;
  SECTION_1_GENERAL_INFO.subsections.forEach(sub => {
    totalFieldsInConfig += sub.fields.length;
  });

  const totalSelected = selectedFields.size + selectedRecords.size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Преглед на мапинг за Секция 1: Обща информация
        </h2>
        <p className="text-sm text-gray-600">
          Избрани: <span className="font-semibold">{totalSelected}</span> от {mapping.fields.length + mapping.records.length} намерени
          {' • '}
          Общо очаквани: <span className="font-semibold">{totalFieldsInConfig}</span> полета
        </p>
      </div>

      {/* All Subsections from Config */}
      {SECTION_1_GENERAL_INFO.subsections.map((subsection) => {
        if (subsection.type === 'direct_fields') {
          return (
            <div key={subsection.subsectionId} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  {subsection.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{subsection.description}</p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {subsection.fields.map((configField) => {
                  const mapping = fieldMappingMap.get(configField.key);
                  
                  if (mapping) {
                    // Field has mapping - show it
                    return (
                      <FieldMappingRow
                        key={configField.key}
                        field={mapping}
                        isSelected={selectedFields.has(configField.key)}
                        onToggle={() => handleFieldToggle(configField.key)}
                      />
                    );
                  } else {
                    // Field missing - show placeholder
                    return (
                      <MissingFieldRow
                        key={configField.key}
                        fieldKey={configField.key}
                        fieldLabel={configField.label}
                      />
                    );
                  }
                })}
              </div>
            </div>
          );
        } else if (subsection.type === 'record_list') {
          const recordMapping = recordMappingMap.get(subsection.subsectionId);
          
          return (
            <div key={subsection.subsectionId} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {subsection.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{subsection.description}</p>
                  </div>
                  {recordMapping && (
                    <span className="text-sm text-gray-600">
                      {recordMapping.records.length} {recordMapping.records.length === 1 ? 'запис' : 'записа'}
                    </span>
                  )}
                </div>
              </div>
              
              {recordMapping ? (
                <RecordMappingRow
                  record={recordMapping}
                  isSelected={selectedRecords.has(subsection.subsectionId)}
                  onToggle={() => handleRecordToggle(subsection.subsectionId)}
                />
              ) : (
                <MissingRecordRow subsectionTitle={subsection.title} />
              )}
            </div>
          );
        }
        
        return null;
      })}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Назад
        </button>
        <button
          onClick={handleConfirm}
          disabled={totalSelected === 0}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Напред към Преглед
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Single field mapping row
 */
function FieldMappingRow({ 
  field, 
  isSelected, 
  onToggle 
}: { 
  field: FieldMapping; 
  isSelected: boolean; 
  onToggle: () => void;
}) {
  const confidenceColors = {
    high: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-red-600 bg-red-50',
  };

  const confidenceLabels = {
    high: 'Висока',
    medium: 'Средна',
    low: 'Ниска',
  };

  return (
    <div className={`p-4 ${isSelected ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />

        {/* Mapping Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Expected Field */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500">ОЧАКВАНО ПОЛЕ</div>
            <div className="text-sm font-semibold text-gray-900">{field.targetLabel}</div>
            <div className="text-xs text-gray-500">Ключ: {field.targetField}</div>
          </div>

          {/* Right: Extracted Value */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500">ИЗВЛЕЧЕНА СТОЙНОСТ</div>
            <div className="text-sm text-gray-900 font-medium break-words">
              {field.sourceValue || '-'}
            </div>
            <div className="text-xs text-gray-500">Източник: {field.sourceLabel}</div>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className={`px-2 py-1 rounded text-xs font-medium ${confidenceColors[field.confidence]}`}>
          {confidenceLabels[field.confidence]}
        </div>
      </div>
    </div>
  );
}

/**
 * Record mapping row (for tables)
 */
function RecordMappingRow({
  record,
  isSelected,
  onToggle,
}: {
  record: RecordMapping;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const confidenceColors = {
    high: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-red-600 bg-red-50',
  };

  const confidenceLabels = {
    high: 'Висока',
    medium: 'Средна',
    low: 'Ниска',
  };

  return (
    <div className={`${isSelected ? 'bg-blue-50' : 'bg-white'}`}>
      <div className="p-4 flex items-start gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">ИЗВЛЕЧЕНА ТАБЛИЦА</div>
              <div className="text-sm font-semibold text-gray-900">{record.sourceTable}</div>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${confidenceColors[record.confidence]}`}>
              {confidenceLabels[record.confidence]}
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? '▼ Скрий записите' : `▶ Покажи ${record.records.length} записа`}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2">
              {record.records.map((rec, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded p-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(rec).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-500">{key}:</span>{' '}
                        <span className="text-gray-900 font-medium">{value || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Missing field row - for fields without mapping data
 */
function MissingFieldRow({ 
  fieldKey, 
  fieldLabel 
}: { 
  fieldKey: string; 
  fieldLabel: string;
}) {
  return (
    <div className="p-4 bg-gray-50 opacity-75">
      <div className="flex items-start gap-4">
        {/* Disabled Checkbox */}
        <input
          type="checkbox"
          disabled
          className="mt-1 h-4 w-4 text-gray-300 rounded border-gray-300 cursor-not-allowed"
        />

        {/* Mapping Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Expected Field */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500">ОЧАКВАНО ПОЛЕ</div>
            <div className="text-sm font-semibold text-gray-700">{fieldLabel}</div>
            <div className="text-xs text-gray-400">Ключ: {fieldKey}</div>
          </div>

          {/* Right: Missing Value */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500">ИЗВЛЕЧЕНА СТОЙНОСТ</div>
            <div className="text-sm text-gray-500 italic">
              Липсва подходяща информация в HTML файла
            </div>
          </div>
        </div>

        {/* Missing Badge */}
        <div className="px-2 py-1 rounded text-xs font-medium text-gray-500 bg-gray-200">
          Липсва
        </div>
      </div>
    </div>
  );
}

/**
 * Missing record row - for record_list without mapping data
 */
function MissingRecordRow({ 
  subsectionTitle 
}: { 
  subsectionTitle: string;
}) {
  return (
    <div className="p-4 bg-gray-50 opacity-75">
      <div className="flex items-start gap-4">
        {/* Disabled Checkbox */}
        <input
          type="checkbox"
          disabled
          className="mt-1 h-4 w-4 text-gray-300 rounded border-gray-300 cursor-not-allowed"
        />

        {/* Content */}
        <div className="flex-1">
          <div className="text-xs font-medium text-gray-500 mb-2">ТАБЛИЦА С ЗАПИСИ</div>
          <div className="text-sm text-gray-500 italic">
            Липсва подходяща информация в HTML файла
          </div>
        </div>

        {/* Missing Badge */}
        <div className="px-2 py-1 rounded text-xs font-medium text-gray-500 bg-gray-200">
          Липсва
        </div>
      </div>
    </div>
  );
}
