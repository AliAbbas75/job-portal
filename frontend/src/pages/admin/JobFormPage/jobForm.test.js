import { emptyForm, errorsFromApi, formFromJob, payloadFromForm, validateForm } from './jobForm';

const filled = () => ({
  ...emptyForm(),
  title: 'Gateman',
  department: 'TRF',
  category: 'gateman',
  bps: '2',
  location: 'Sukkur',
  vacancies: '10',
  summary: 'Operate level-crossing gates.',
  description: 'Full description.',
  openingDate: '2026-10-01',
  closingDate: '2026-10-21',
  minQualification: 'matric',
  ageMax: '30',
  quotas: [
    { category: 'open_merit', seats: '8' },
    { category: 'minority', seats: '2' },
  ],
});

describe('jobForm', () => {
  it('builds the API payload with whole-day dates in Pakistan time', () => {
    const payload = payloadFromForm(filled());
    expect(payload.openingDate).toBe('2026-10-01T00:00:00+05:00');
    expect(payload.closingDate).toBe('2026-10-21T23:59:59+05:00');
    expect(payload.vacancies).toBe(10);
    expect(payload.requirements).toMatchObject({
      minQualification: 'matric',
      ageMin: 18,
      ageMax: 30,
    });
    expect(payload.quotas).toEqual([
      { category: 'open_merit', seats: 8 },
      { category: 'minority', seats: 2 },
    ]);
  });

  it('round-trips a saved job back into the form', () => {
    const form = filled();
    const payload = payloadFromForm(form);
    const job = { ...payload, id: 'j-1', requirements: payload.requirements };
    expect(formFromJob(job)).toMatchObject({
      openingDate: '2026-10-01',
      closingDate: '2026-10-21',
      bps: '2',
      quotas: form.quotas,
    });
  });

  it('checks required fields, dates, ages and quota totals', () => {
    expect(validateForm(filled())).toEqual({});
    expect(Object.keys(validateForm(emptyForm()))).toContain('title');
    const errors = validateForm({
      ...filled(),
      closingDate: '2026-09-01',
      ageMin: '40',
      quotas: [{ category: 'open_merit', seats: '3' }],
    });
    expect(Object.keys(errors).sort()).toEqual(['ageMax', 'closingDate', 'quotas']);
  });

  it('maps nested API errors onto form fields', () => {
    expect(
      errorsFromApi({ title: ['Too long.'], requirements: { ageMax: ['Too small.'] } }),
    ).toEqual({
      title: 'Too long.',
      ageMax: 'Too small.',
    });
  });
});

describe('jobForm gender and criteria (T-148)', () => {
  it('sends gender and one criterion per line, and reads them back', () => {
    const payload = payloadFromForm({
      ...emptyForm(),
      gender: 'male',
      eligibilityCriteria: 'Physically fit\n\n  Literate in Urdu ',
    });
    expect(payload.requirements.gender).toBe('male');
    expect(payload.eligibilityCriteria).toEqual(['Physically fit', 'Literate in Urdu']);
    expect(payloadFromForm(emptyForm()).requirements.gender).toBeNull();
    const form = formFromJob({ ...payload, id: 'j-1', quotas: [] });
    expect(form.gender).toBe('male');
    expect(form.eligibilityCriteria).toBe('Physically fit\nLiterate in Urdu');
  });
});
