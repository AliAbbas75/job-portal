import { t } from '.';

describe('t', () => {
  it('interpolates variables', () => {
    expect(t('jobs.posted', { when: 'yesterday' })).toBe('Posted yesterday');
  });

  it('picks _zero and _one variants from count', () => {
    expect(t('jobs.closesIn', { count: 0 })).toBe('Closes today');
    expect(t('jobs.closesIn', { count: 1 })).toBe('Closes tomorrow');
    expect(t('jobs.closesIn', { count: 5 })).toBe('Closes in 5 days');
  });

  it('returns the key when a message is missing', () => {
    expect(t('does.not.exist')).toBe('does.not.exist');
  });
});
