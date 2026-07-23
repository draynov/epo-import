/**
 * Select Component
 */

import { SelectHTMLAttributes, forwardRef } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export type SelectOptions = SelectOption[] | SelectOptionGroup[];

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOptions;
  placeholder?: string;
}

// Type guard to check if options are grouped
function isGroupedOptions(options: SelectOptions): options is SelectOptionGroup[] {
  return options.length > 0 && 'options' in options[0];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, options, placeholder, ...props }, ref) => {
    const renderOptions = () => {
      if (isGroupedOptions(options)) {
        // Render with optgroups
        return options.map((group, groupIndex) => (
          <optgroup key={groupIndex} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ));
      } else {
        // Render flat options
        return options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ));
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-3 py-2 border rounded-md text-gray-900 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {renderOptions()}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
