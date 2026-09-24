import { ageOn, checkEligibility } from './eligibilityMock';

const job = {
  closingDate: '2026-10-15T00:00:00.000Z',
  requirements: {
    minQualification: 'intermediate',
    minMarksPercent: 45,
    experienceYears: 0,
    ageMin: 18,
    ageMax: 28,
    domicileProvinces: ['SD'],
    documents: ['cnic_copy', 'photo'],
  },
};

function profile(overrides = {}) {
  return {
    personal: { dob: '2000-01-01' },
    domicile: { province: 'SD' },
    education: [{ level: 'bachelor14', marksPercent: '60' }],
    experience: [],
    ...overrides,
  };
}

const allDocs = [
  { id: 'd1', type: 'cnic_copy' },
  { id: 'd2', type: 'photo' },
];

const item = (result, key) => result.items.find((i) => i.key === key);

describe('ageOn', () => {
  it('counts birthdays that have not happened yet', () => {
    expect(ageOn('2000-10-16', '2026-10-15')).toBe(25);
    expect(ageOn('2000-10-15', '2026-10-15')).toBe(26);
  });
});

describe('checkEligibility (mock)', () => {
  it('passes a complete, eligible profile', () => {
    const result = checkEligibility(job, profile(), allDocs);
    expect(result.eligible).toBe(true);
    expect(result.complete).toBe(true);
  });

  it('marks absent data as missing, not ineligible', () => {
    const result = checkEligibility(
      job,
      profile({ education: [], personal: { dob: '' }, domicile: { province: '' } }),
      [],
    );
    expect(result.eligible).toBe(true);
    expect(result.complete).toBe(false);
    expect(item(result, 'education').status).toBe('missing');
    expect(item(result, 'age').status).toBe('missing');
    expect(
      result.items.filter((i) => i.key === 'document').every((i) => i.status === 'missing'),
    ).toBe(true);
  });

  it('rejects age outside the range on the closing date', () => {
    const result = checkEligibility(job, profile({ personal: { dob: '1990-01-01' } }), allDocs);
    expect(item(result, 'age')).toMatchObject({ status: 'not_met', actual: 36 });
    expect(result.eligible).toBe(false);
  });

  it('rejects low marks and the wrong domicile', () => {
    const result = checkEligibility(
      job,
      profile({
        education: [{ level: 'intermediate', marksPercent: '40' }],
        domicile: { province: 'PB' },
      }),
      allDocs,
    );
    expect(item(result, 'education')).toMatchObject({ status: 'not_met', reason: 'marks' });
    expect(item(result, 'domicile').status).toBe('not_met');
  });
});
