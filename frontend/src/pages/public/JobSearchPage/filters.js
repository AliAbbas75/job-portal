/** Job search filters kept in the URL query string (see backend JobSearchArgsSchema). */
export const FILTER_KEYS = ['q', 'scale', 'department', 'category', 'location', 'qualification'];

export const PAGE_SIZES = [10, 20, 50];

/** Reference-data list → select options. */
export const toOptions = (list = []) =>
  list.map((item) => ({ value: item.code, label: item.name }));
