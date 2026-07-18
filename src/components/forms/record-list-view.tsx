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
    // Priority fields to show: institution, position, godina_from, godina_to
    const priorityKeys = ['institution', 'position', 'dlyvnost', 'godina_from', 'godina_to', 'name', 'specialty'];
    return subsection.fields.filter(f => priorityKeys.includes(f.key));
  };

  // Format cell value based on field type and record data
  const formatCellValue = (field: any, record: Record<string, unknown>) => {
    // Special handling for godina_to when now_to is checked
    if (field.key === 'godina_to' && record.now_to === true) {
      return 'До сега';
    }

    const value = record[field.key];

    if (!value && value !== 0 && value !== false) {
      return '-';
    }

    if (field.key.includes('mesec') && typeof value === 'number') {
      return formatMonth(value);
    }

    if (field.type === 'boolean' || field.type === 'checkbox') {
      return value ? 'Да' : 'Не';
    }

    return String(value);
  };

  const displayFields = getDisplayFields();

  return (
    <div className="space-y-4">
      {/* Records Table or Empty State */}
      {records.length === 0 ? (
        <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-300">
          <p className="text-gray-600">Няма добавени записи</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <table className="min-w-full divide-y divide-gray-200">
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
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  {displayFields.map((field) => (
                    <td key={field.key} className="px-4 py-3 text-sm text-gray-900">
                      {formatCellValue(field, record)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right text-sm">
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
