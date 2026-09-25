import { t, tList } from '.';

describe('t', () => {
  it('interpolates variables', () => {
    expect(t('jobs.bps', { bps: 11 })).toBe('BPS-11');
  });

  it('picks _zero and _one variants from count', () => {
    expect(t('jobs.closesIn', { count: 0 })).toBe('Closes today');
    expect(t('jobs.closesIn', { count: 1 })).toBe('Closes tomorrow');
    expect(t('jobs.closesIn', { count: 5 })).toBe('Closes in 5 days');
  });

  it('returns lists for tList, or an empty list', () => {
    expect(tList('faq.general').length).toBeGreaterThan(0);
    expect(tList('faq.general')[0]).toHaveProperty('q');
    expect(tList('jobs.bps')).toEqual([]);
  });

  it('returns the key when a message is missing', () => {
    expect(t('does.not.exist')).toBe('does.not.exist');
  });
});
