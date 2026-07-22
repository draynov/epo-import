/**
 * Record Modal Component
 * Малък модал за добавяне/редакция на ЕДИН запис в списък
 */

"use client";

import { useState, useEffect } from "react";
import { RecordListSubsectionDefinition } from "@/types";
import { DynamicField } from "./dynamic-field";
import { Button, Modal } from "@/components/ui";

export interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  subsection: RecordListSubsectionDefinition;
  record?: Record<string, unknown>;
  onSave: (record: Record<string, unknown>) => void;
}

export function RecordModal({
  isOpen,
  onClose,
  subsection,
  record,
  onSave,
}: RecordModalProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(record || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(record || {});
      setErrors({});
    }
  }, [isOpen, record]);

  const handleFieldChange = (key: string, value: unknown) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };
      
      // If "now_to" checkbox is checked, clear mesec_to and godina_to
      if (key === "now_to" && value === true) {
        updated.mesec_to = undefined;
        updated.godina_to = undefined;
      }
      
      return updated;
    });
    
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    // Валидация
    const newErrors: Record<string, string> = {};
    const hasNowTo = formData.now_to === true;

    for (const field of subsection.fields) {
      // Skip validation for fields disabled by now_to
      const isDisabledByNowTo = hasNowTo && (field.key === "mesec_to" || field.key === "godina_to");
      
      if (isDisabledByNowTo) {
        continue;
      }
      
      // Custom required logic
      let isRequired = field.required;
      
      // godina_from is always required if it exists
      if (field.key === "godina_from") {
        isRequired = true;
      }
      
      // Check for empty values
      if (isRequired && !formData[field.key]) {
        newErrors[field.key] = `${field.label} е задължително поле`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? "Редактирай запис" : "Добави запис"}
    >
      <div className="space-y-4">
        {subsection.fields.map((field) => {
          const hasNowTo = formData.now_to === true;
          const isDisabled = hasNowTo && (field.key === "mesec_to" || field.key === "godina_to");
          
          return (
            <DynamicField
              key={field.key}
              field={field}
              value={formData[field.key]}
              onChange={(value) => handleFieldChange(field.key, value)}
              error={errors[field.key]}
              disabled={isDisabled}
            />
          );
        })}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} className="flex-1">
            {record ? "Запази промените" : "Добави"}
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Отказ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
