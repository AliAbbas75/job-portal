const DAY_MS = 24 * 60 * 60 * 1000;

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const longDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** "Thursday, 18 September 2026". */
export function formatLongDate(value) {
  if (!value) return '';
  return longDateFormatter.format(new Date(value));
}

export function formatDate(value) {
  if (!value) return '';
  return dateFormatter.format(new Date(value));
}

/** Whole days from `now` until `value`; negative once the date has passed. */
export function daysUntil(value, now = new Date()) {
  const end = new Date(value);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((startOfEnd - startOfToday) / DAY_MS);
}

/** "3 hours ago", "yesterday", "2 weeks ago". */
export function formatRelative(value, now = new Date()) {
  const diffSeconds = Math.round((new Date(value) - now) / 1000);
  const units = [
    ['year', 365 * 24 * 3600],
    ['month', 30 * 24 * 3600],
    ['week', 7 * 24 * 3600],
    ['day', 24 * 3600],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return relativeFormatter.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return relativeFormatter.format(0, 'minute');
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCurrency(amount) {
  return `Rs ${new Intl.NumberFormat('en-PK').format(amount)}`;
}

/** Formats 13 digits as 00000-0000000-0 while the user types. */
export function formatCnic(value) {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}
