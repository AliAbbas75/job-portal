import { daysUntil, formatCnic, formatFileSize } from './format';
import { safeNext } from './safeNext';

describe('formatCnic', () => {
  it('inserts dashes as digits are typed', () => {
    expect(formatCnic('12345')).toBe('12345');
    expect(formatCnic('123451')).toBe('12345-1');
    expect(formatCnic('1234512345671')).toBe('12345-1234567-1');
  });

  it('drops non-digits and extra digits', () => {
    expect(formatCnic('12345-12345671999')).toBe('12345-1234567-1');
    expect(formatCnic('ab12')).toBe('12');
  });
});

describe('daysUntil', () => {
  const now = new Date(2026, 8, 24, 15, 0);

  it('counts whole calendar days', () => {
    expect(daysUntil(new Date(2026, 8, 24, 23, 59), now)).toBe(0);
    expect(daysUntil(new Date(2026, 8, 25, 0, 1), now)).toBe(1);
    expect(daysUntil(new Date(2026, 9, 1), now)).toBe(7);
  });

  it('is negative once the date has passed', () => {
    expect(daysUntil(new Date(2026, 8, 20), now)).toBe(-4);
  });
});

describe('formatFileSize', () => {
  it('uses B, KB and MB', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });
});

describe('safeNext', () => {
  it('allows same-site paths only', () => {
    expect(safeNext('/jobs/1/apply', '/')).toBe('/jobs/1/apply');
    expect(safeNext('//evil.example', '/')).toBe('/');
    expect(safeNext('/\\evil.example', '/')).toBe('/');
    expect(safeNext('https://evil.example', '/')).toBe('/');
    expect(safeNext(null, '/profile')).toBe('/profile');
  });
});
