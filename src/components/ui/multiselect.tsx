/**
 * MultiSelect Component
 * Рендира списък с checkboxes за множествен избор
 */

"use client";

import { FieldOption, FieldOptionGroup } from "@/types";

export interface MultiSelectProps {
  label: string;
  value: string[]; // Array of selected values
  onChange: (value: string[]) => void;
  options: FieldOption[] | FieldOptionGroup[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
}

export function MultiSelect({
  label,
  value = [],
  onChange,
  options,
  required = false,
  error,
  disabled = false,
  description,
}: MultiSelectProps) {
  // Flatten grouped options if needed
  const flatOptions: FieldOption[] = [];
  
  if (options.length > 0) {
    if ('options' in options[0]) {
      // Grouped options
      for (const group of options as FieldOptionGroup[]) {
        flatOptions.push(...group.options);
      }
    } else {
      // Flat options
      flatOptions.push(...(options as FieldOption[]));
    }
  }

  const handleToggle = (optionValue: string) => {
    if (disabled) return;
    
    const currentValues = Array.isArray(value) ? value : [];
    const isSelected = currentValues.includes(optionValue);
    
    if (isSelected) {
      onChange(currentValues.filter(v => v !== optionValue));
    } else {
      onChange([...currentValues, optionValue]);
    }
  };

  const currentValues = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-xs text-gray-500 -mt-1">{description}</p>
      )}
      
      <div className="border border-gray-300 rounded-md p-3 max-h-64 overflow-y-auto bg-white">
        {flatOptions.length === 0 ? (
          <p className="text-sm text-gray-500">Няма налични опции</p>
        ) : (
          <div className="space-y-2">
            {flatOptions.map((option) => {
              const isChecked = currentValues.includes(option.value);
              
              return (
                <label
                  key={option.value}
                  className={`flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(option.value)}
                    disabled={disabled}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
      
      {currentValues.length > 0 && (
        <div className="text-xs text-gray-600">
          Избрани: {currentValues.length}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
