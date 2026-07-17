/**
 * Date-related options for dropdowns
 */

export const MONTHS = [
  { value: 1, label: "януари" },
  { value: 2, label: "февруари" },
  { value: 3, label: "март" },
  { value: 4, label: "април" },
  { value: 5, label: "май" },
  { value: 6, label: "юни" },
  { value: 7, label: "юли" },
  { value: 8, label: "август" },
  { value: 9, label: "септември" },
  { value: 10, label: "октомври" },
  { value: 11, label: "ноември" },
  { value: 12, label: "декември" },
];

// Generate years from current year down to 1950
const currentYear = new Date().getFullYear();
export const YEARS = Array.from(
  { length: currentYear - 1949 },
  (_, i) => ({
    value: currentYear - i,
    label: (currentYear - i).toString(),
  })
);
