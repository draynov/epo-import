/**
 * Dynamic Field Component
 * Рендира поле според типа от конфигурацията
 */

"use client";

import { PortfolioFieldDefinition } from "@/types";
import { Input, Textarea, Select } from "@/components/ui";
import { MONTHS, YEARS } from "@/config/date-options";

export interface DynamicFieldProps {
  field: PortfolioFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

export function DynamicField({ field, value, onChange, error, disabled }: DynamicFieldProps) {
  const stringValue = value?.toString() || "";

  switch (field.type) {
    case "text":
      return (
        <Input
          label={field.label}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          error={error}
          disabled={disabled}
        />
      );

    case "textarea":
      return (
        <Textarea
          label={field.label}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          error={error}
          disabled={disabled}
        />
      );

    case "number":
      // Special handling for month and year fields
      if (field.key.includes("mesec")) {
        return (
          <Select
            label={field.label}
            value={stringValue}
            onChange={(e) => onChange(parseInt(e.target.value))}
            options={MONTHS}
            required={field.required}
            error={error}
            placeholder="Избери месец..."
            disabled={disabled}
          />
        );
      }
      
      if (field.key.includes("godina")) {
        return (
          <Select
            label={field.label}
            value={stringValue}
            onChange={(e) => onChange(parseInt(e.target.value))}
            options={YEARS}
            required={field.required}
            error={error}
            placeholder="Избери година..."
            disabled={disabled}
          />
        );
      }
      
      return (
        <Input
          type="number"
          label={field.label}
          value={stringValue}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          required={field.required}
          error={error}
          disabled={disabled}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          label={field.label}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          error={error}
        />
      );

    case "month_year":
      return (
        <Input
          type="month"
          label={field.label}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          error={error}
        />
      );

    case "boolean":
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={field.key}
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label htmlFor={field.key} className="text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );

    case "select":
      if (!field.options) return null;
      return (
        <Select
          label={field.label}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          options={field.options}
          required={field.required}
          error={error}
          placeholder="Избери..."
        />
      );

    case "multiselect":
      // TODO: Implement multiselect
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} (multiselect - coming soon)
          </label>
        </div>
      );

    default:
      return null;
  }
}
