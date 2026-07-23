/**
 * Типове на полетата в портфолиото
 */
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "boolean"
  | "select"
  | "multiselect"
  | "checkbox"
  | "month_year"; // За mesec_from/godina_from комбинации

/**
 * Опция за select/multiselect полета
 */
export interface FieldOption {
  value: string | number;
  label: string;
}

/**
 * Група от опции за select/multiselect (за optgroup)
 */
export interface FieldOptionGroup {
  label: string;
  options: FieldOption[];
}

/**
 * Опции могат да бъдат flat array или групиран array
 */
export type FieldOptions = FieldOption[] | FieldOptionGroup[];

/**
 * Дефиниция на поле в портфолиото
 */
export interface PortfolioFieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  description?: string;
  options?: FieldOptions;
  placeholder?: string;
  
  // За date полета
  minDate?: string;
  maxDate?: string;
  
  // За text/textarea полета
  minLength?: number;
  maxLength?: number;
  
  // За number полета
  min?: number;
  max?: number;
  
  // За conditional fields (напр. actual_position_other се показва само ако actual_position === 'Друга')
  conditionalOn?: {
    field: string;
    value: string | number;
  };
  
  // За record list tables - дали да се показва в таблицата
  showInTable?: boolean; // По подразбиране true
}
