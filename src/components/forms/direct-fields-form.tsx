/**
 * Direct Fields Form Component
 * Форма за direct_fields подсекции
 */

"use client";

import { useState, useEffect } from "react";
import { DirectFieldsSubsectionDefinition } from "@/types";
import { DynamicField } from "./dynamic-field";
import { Button } from "@/components/ui";

export interface DirectFieldsFormProps {
  subsection: DirectFieldsSubsectionDefinition;
  initialData?: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

export function DirectFieldsForm({
  subsection,
  initialData = {},
  onSave,
  onCancel,
}: DirectFieldsFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when subsection changes
  useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [subsection.subsectionId, initialData]);

  const handleFieldChange = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    const newErrors: Record<string, string> = {};

    for (const field of subsection.fields) {
      // Check conditional fields
      if (field.conditionalOn) {
        const conditionValue = formData[field.conditionalOn.field];
        if (conditionValue !== field.conditionalOn.value) {
          continue; // Skip validation for hidden conditional fields
        }
      }

      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} е задължително поле`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {subsection.fields.map((field) => {
        // Check if field should be visible
        if (field.conditionalOn) {
          const conditionValue = formData[field.conditionalOn.field];
          if (conditionValue !== field.conditionalOn.value) {
            return null; // Hide conditional field
          }
        }

        return (
          <DynamicField
            key={field.key}
            field={field}
            value={formData[field.key]}
            onChange={(value) => handleFieldChange(field.key, value)}
            error={errors[field.key]}
          />
        );
      })}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отказ
        </Button>
        <Button type="submit">Запази</Button>
      </div>
    </form>
  );
}
