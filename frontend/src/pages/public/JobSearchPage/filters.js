/** Search filters kept in the URL query string. */
export const FILTER_KEYS = [
  'q',
  'sort',
  'bps',
  'department',
  'employmentType',
  'location',
  'qualification',
  'closing',
];

/** Reference-data list → select options. */
export const toOptions = (list = []) =>
  list.map((item) => ({ value: item.code, label: item.name }));
