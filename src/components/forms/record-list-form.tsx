/**
 * Record List Form Component
 * Форма за record_list подсекции (таблица с записи)
 */

"use client";

import { useState } from "react";
import { RecordListSubsectionDefinition } from "@/types";
import { DynamicField } from "./dynamic-field";
import { Button, Modal } from "@/components/ui";

export interface RecordListFormProps {
  subsection: RecordListSubsectionDefinition;
  initialData?: Array<Record<string, unknown>>;
  onSave: (data: Array<Record<string, unknown>>) => void;
  onCancel: () => void;
}

export function RecordListForm({
  subsection,
  initialData = [],
  onSave,
  onCancel,
}: RecordListFormProps) {
  const [records, setRecords] = useState<Array<Record<string, unknown>>>(initialData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentRecord, setCurrentRecord] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddRecord = () => {
    setCurrentRecord({});
    setEditingIndex(null);
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleEditRecord = (index: number) => {
    setCurrentRecord({ ...records[index] });
    setEditingIndex(index);
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleDeleteRecord = (index: number) => {
    if (confirm("Сигурни ли сте, че искате да изтриете този запис?")) {
      setRecords((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveRecord = () => {
    // Валидация
    const newErrors: Record<string, string> = {};

    for (const field of subsection.fields) {
      if (field.required && !currentRecord[field.key]) {
        newErrors[field.key] = `${field.label} е задължително поле`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingIndex !== null) {
      // Update existing record
      setRecords((prev) => {
        const newRecords = [...prev];
        newRecords[editingIndex] = currentRecord;
        return newRecords;
      });
    } else {
      // Add new record
      setRecords((prev) => [...prev, currentRecord]);
    }

    setIsAddModalOpen(false);
    setCurrentRecord({});
    setEditingIndex(null);
  };

  const handleFieldChange = (key: string, value: unknown) => {
    setCurrentRecord((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Records Table */}
      {records.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-3">Няма добавени записи</p>
          <Button onClick={handleAddRecord}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5 inline"
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
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {subsection.fields.slice(0, 3).map((field) => (
                    <th
                      key={field.key}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {field.label}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {subsection.fields.slice(0, 3).map((field) => (
                      <td key={field.key} className="px-4 py-2 text-sm text-gray-900">
                        {String(record[field.key] || "-")}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right text-sm space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditRecord(index)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
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
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteRecord(index)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
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
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={handleAddRecord}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5 inline"
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
        </>
      )}

      {/* Save/Cancel buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="secondary" onClick={onCancel}>
          Отказ
        </Button>
        <Button onClick={() => onSave(records)}>Запази ({records.length} записа)</Button>
      </div>

      {/* Add/Edit Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingIndex !== null ? "Редактирай запис" : "Добави запис"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Отказ
            </Button>
            <Button onClick={handleSaveRecord}>
              {editingIndex !== null ? "Обнови" : "Добави"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {subsection.fields.map((field) => {
            // Check conditional fields
            if (field.conditionalOn) {
              const conditionValue = currentRecord[field.conditionalOn.field];
              if (conditionValue !== field.conditionalOn.value) {
                return null;
              }
            }

            return (
              <DynamicField
                key={field.key}
                field={field}
                value={currentRecord[field.key]}
                onChange={(value) => handleFieldChange(field.key, value)}
                error={errors[field.key]}
              />
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
