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
          <Button onClick={handleAddRecord}>➕ Добави запис</Button>
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
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteRecord(index)}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={handleAddRecord}>➕ Добави запис</Button>
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
