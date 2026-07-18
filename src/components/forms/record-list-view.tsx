/**
 * Record List View Component
 * Inline view (БЕЗ модал) за record_list подсекции
 */

"use client";

import { useState } from "react";
import { RecordListSubsectionDefinition } from "@/types";
import { Button } from "@/components/ui";
import { RecordModal } from "./record-modal";
import { MONTHS } from "@/config/date-options";

export interface RecordListViewProps {
  subsection: RecordListSubsectionDefinition;
  portfolioId: string;
  initialData?: { records?: Array<Record<string, unknown>> };
  onDataChange: (data: { records: Array<Record<string, unknown>> }) => void;
}

export function RecordListView({
  subsection,
  portfolioId,
  initialData,
  onDataChange,
}: RecordListViewProps) {
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

  const handleAddRecord = () => {
    setEditingIndex(null);
    setEditingRecord(undefined);
    setIsRecordModalOpen(true);
  };

  const handleEditRecord = (index: number) => {
    setEditingIndex(index);
    setEditingRecord({ ...records[index] });
    setIsRecordModalOpen(true);
  };

  const handleDeleteRecord = (index: number) => {
    if (confirm("Сигурни ли сте, че искате да изтриете този запис?")) {
      const newRecords = records.filter((_, i) => i !== index);
      setRecords(newRecords);
      onDataChange({ records: newRecords });
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
    onDataChange({ records: newRecords });
  };

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">{subsection.title}</h3>
        <Button onClick={handleAddRecord} className="bg-green-600 hover:bg-green-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Добави запис
        </Button>
      </div>

      {/* Description */}
      {subsection.description && records.length === 0 && (
        <p className="text-sm text-gray-600">{subsection.description}</p>
      )}

      {/* Records Table or Empty State */}
      {records.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-3">Няма добавени записи</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {subsection.fields.slice(0, 5).map((field) => (
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
                  {subsection.fields.slice(0, 5).map((field) => (
                    <td key={field.key} className="px-4 py-3 text-sm text-gray-900">
                      {field.key.includes("mesec") &&
                      typeof record[field.key] === "number"
                        ? formatMonth(record[field.key] as number)
                        : field.type === "boolean"
                        ? record[field.key]
                          ? "Да"
                          : "Не"
                        : String(record[field.key] || "-")}
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
