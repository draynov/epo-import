/**
 * Record List View Component
 * Inline view (БЕЗ модал) за record_list подсекции
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { RecordListSubsectionDefinition } from "@/types";
import { Button } from "@/components/ui";
import { RecordModal } from "./record-modal";
import { MONTHS } from "@/config/date-options";
import { getCompetenceGroup, CLASS_LEVELS, GROUP_TYPES } from "@/config/field-options";

export interface RecordListViewProps {
  subsection: RecordListSubsectionDefinition;
  portfolioId: string;
  subsectionId: string;
  initialData?: { records?: Array<Record<string, unknown>> };
  onDataChange: (subsectionId: string, data: { records: Array<Record<string, unknown>> }) => void;
  onRegisterAddTrigger?: (trigger: () => void) => void; // Register the add handler with parent
}

export function RecordListView({
  subsection,
  subsectionId,
  portfolioId,
  initialData,
  onDataChange,
  onRegisterAddTrigger,
}: RecordListViewProps) {
  // UNCONTROLLED: Initialize from initialData, then manage own state
  const [records, setRecords] = useState<Array<Record<string, unknown>>>(
    initialData?.records || []
  );
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | undefined>();

  // Format month helper
  const formatMonth = (month: number | string): string => {
    const monthNum = typeof month === "string" ? parseInt(month) : month;
    const monthObj = MONTHS.find((m) => m.value === monthNum);
    return monthObj ? monthObj.label : String(month);
  };

  const handleAddRecord = useCallback(() => {
    setEditingIndex(null);
    setEditingRecord(undefined);
    setIsRecordModalOpen(true);
  }, []);

  // Register add handler with parent on mount
  useEffect(() => {
    if (onRegisterAddTrigger) {
      onRegisterAddTrigger(handleAddRecord);
    }
  }, [onRegisterAddTrigger, handleAddRecord]);

  const handleEditRecord = (index: number) => {
    setEditingIndex(index);
    setEditingRecord({ ...records[index] });
    setIsRecordModalOpen(true);
  };

  const handleDeleteRecord = (index: number) => {
    if (confirm("Сигурни ли сте, че искате да изтриете този запис?")) {
      const newRecords = records.filter((_, i) => i !== index);
      setRecords(newRecords);
      onDataChange(subsectionId, { records: newRecords });
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newRecords = [...records];
    [newRecords[index - 1], newRecords[index]] = [newRecords[index], newRecords[index - 1]];
    setRecords(newRecords);
    onDataChange(subsectionId, { records: newRecords });
  };

  const handleMoveDown = (index: number) => {
    if (index === records.length - 1) return;
    const newRecords = [...records];
    [newRecords[index], newRecords[index + 1]] = [newRecords[index + 1], newRecords[index]];
    setRecords(newRecords);
    onDataChange(subsectionId, { records: newRecords });
  };

  const handleSaveRecord = (record: Record<string, unknown>) => {
    let newRecords: Array<Record<string, unknown>>;
    
    if (editingIndex !== null) {
      // Update existing
      newRecords = [...records];
      newRecords[editingIndex] = record;
    } else {
      // Add new
      newRecords = [...records, record];
    }
    
    setRecords(newRecords);
    onDataChange(subsectionId, { records: newRecords });
  };

  // Determine which fields to display in table
  const getDisplayFields = () => {
    // Filter fields based on showInTable property (default true)
    // Also hide multiclass and multigroup (shown in class/group column instead)
    return subsection.fields.filter(f => 
      f.showInTable !== false && 
      f.key !== 'multiclass' && 
      f.key !== 'multigroup'
    );
  };

  // Format cell value based on field type and record data
  const formatCellValue = (field: any, record: Record<string, unknown>) => {
    // Special handling for class field - show class or multiple classes
    if (field.key === 'class') {
      const classValue = record.class;
      
      // Check if "Повече от един клас" (value: 20)
      if (String(classValue) === '20') {
        const multiclass = record.multiclass;
        if (Array.isArray(multiclass) && multiclass.length > 0) {
          // Show list of selected classes
          const classNames = multiclass
            .map(val => {
              const option = CLASS_LEVELS.find(opt => String(opt.value) === String(val));
              return option ? option.label : String(val);
            })
            .join(', ');
          return classNames || '-';
        }
        return 'Повече от един клас';
      }
      
      // Single class - find label
      const option = CLASS_LEVELS.find(opt => String(opt.value) === String(classValue));
      return option ? option.label : (classValue ? String(classValue) : '-');
    }
    
    // Special handling for group field - show group or multiple groups
    if (field.key === 'group') {
      const groupValue = record.group;
      
      // Check if "Повече от една група" (value: 6)
      if (String(groupValue) === '6') {
        const multigroup = record.multigroup;
        if (Array.isArray(multigroup) && multigroup.length > 0) {
          // Show list of selected groups
          const groupNames = multigroup
            .map(val => {
              const option = GROUP_TYPES.find(opt => String(opt.value) === String(val));
              return option ? option.label : String(val);
            })
            .join(', ');
          return groupNames || '-';
        }
        return 'Повече от една група';
      }
      
      // Single group - find label
      const option = GROUP_TYPES.find(opt => String(opt.value) === String(groupValue));
      return option ? option.label : (groupValue ? String(groupValue) : '-');
    }
    
    // Special handling for godina_to when now_to is checked
    if (field.key === 'godina_to') {
      const nowTo = record.now_to;
      // Check for both boolean true and string 'true' / '1'
      if (nowTo === true || nowTo === 'true' || nowTo === '1' || nowTo === 1) {
        return 'До сега';
      }
    }

    const value = record[field.key];

    if (!value && value !== 0 && value !== false) {
      return '-';
    }

    // Special handling for godina_from and godina_to - include month if present
    if (field.key === 'godina_from' && typeof value === 'number') {
      const month = record.mesec_from;
      if (typeof month === 'number' && month >= 1 && month <= 12) {
        const monthStr = month.toString().padStart(2, '0');
        return `${monthStr}.${value}`;
      }
      return String(value);
    }
    
    // Handle godina_from as string
    if (field.key === 'godina_from' && typeof value === 'string') {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue > 0) {
        const month = record.mesec_from;
        const monthNum = typeof month === 'string' ? parseInt(month) : month;
        if (typeof monthNum === 'number' && monthNum >= 1 && monthNum <= 12) {
          const monthStr = monthNum.toString().padStart(2, '0');
          return `${monthStr}.${numValue}`;
        }
        return String(numValue);
      }
    }

    if (field.key === 'godina_to' && typeof value === 'number') {
      const month = record.mesec_to;
      if (typeof month === 'number' && month >= 1 && month <= 12) {
        const monthStr = month.toString().padStart(2, '0');
        return `${monthStr}.${value}`;
      }
      return String(value);
    }
    
    // Handle godina_to as string
    if (field.key === 'godina_to' && typeof value === 'string') {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue > 0) {
        const month = record.mesec_to;
        const monthNum = typeof month === 'string' ? parseInt(month) : month;
        if (typeof monthNum === 'number' && monthNum >= 1 && monthNum <= 12) {
          const monthStr = monthNum.toString().padStart(2, '0');
          return `${monthStr}.${numValue}`;
        }
        return String(numValue);
      }
    }

    if (field.key.includes('mesec') && typeof value === 'number') {
      return formatMonth(value);
    }
    
    // Handle mesec fields as strings
    if (field.key.includes('mesec') && typeof value === 'string') {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        return formatMonth(numValue);
      }
    }

    if (field.type === 'boolean' || field.type === 'checkbox') {
      // Handle both boolean and string values
      if (value === true || value === 'true' || value === '1' || value === 1) {
        return 'Да';
      }
      return 'Не';
    }

    // Handle select fields with options
    if (field.type === 'select' && field.options && Array.isArray(field.options)) {
      const option = field.options.find((opt: any) => opt.value === value);
      if (option) {
        return option.label;
      }
    }
    
    // Handle multiselect fields (e.g., years)
    if (field.type === 'multiselect' && Array.isArray(value)) {
      if (value.length === 0) return '-';
      // For years and similar fields, just join the values
      return value.join(', ');
    }

    return String(value);
  };

  const displayFields = getDisplayFields();
  const isCompetencesSubsection = subsectionId === "competences";

  return (
    <div className="space-y-4">
      {/* Records Table or Empty State */}
      {records.length === 0 ? (
        <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-300">
          <p className="text-gray-600">Няма добавени записи</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {displayFields.map((field) => (
                  <th
                    key={field.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {field.label}
                  </th>
                ))}
                {isCompetencesSubsection && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Група
                  </th>
                )}
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {records.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  {displayFields.map((field) => (
                    <td key={field.key} className="px-4 py-3 text-sm text-gray-900">
                      {formatCellValue(field, record)}
                    </td>
                  ))}
                  {isCompetencesSubsection && (
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {getCompetenceGroup(record.competence as string | number) || '-'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="text-gray-600 hover:text-gray-800 mr-2 disabled:text-gray-300 disabled:cursor-not-allowed"
                      title="Премести нагоре"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === records.length - 1}
                      className="text-gray-600 hover:text-gray-800 mr-3 disabled:text-gray-300 disabled:cursor-not-allowed"
                      title="Премести надолу"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditRecord(idx)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Редактирай"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(idx)}
                      className="text-red-600 hover:text-red-800"
                      title="Изтрий"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Add/Edit Modal */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        subsection={subsection}
        record={editingRecord}
        onSave={handleSaveRecord}
      />
    </div>
  );
}
