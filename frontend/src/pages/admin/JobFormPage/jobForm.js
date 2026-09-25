// Converts between a job from the API, the form's string state and the JobInput payload.
import { t } from '../../../i18n';

// Dates are picked as days; a job opens at the start of its opening day and closes at the end
// of its closing day, Pakistan time.
const PKT = '+05:00';
const dayOf = (iso) =>
  iso ? new Date(new Date(iso).getTime() + 5 * 3600 * 1000).toISOString().slice(0, 10) : '';

export const emptyForm = () => ({
  title: '',
  department: '',
  bps: '',
  location: '',
  employmentType: 'permanent',
  vacancies: '',
  requisitionRef: '',
  summary: '',
  description: '',
  openingDate: '',
  closingDate: '',
  ageCutoffDate: '',
  fee: '0',
  minQualification: '',
  minMarksPercent: '',
  experienceYears: '0',
  ageMin: '18',
  ageMax: '',
  domicileProvinces: [],
  documents: ['cnic_copy', 'photo'],
  quotas: [{ category: 'open_merit', seats: '' }],
});

export function formFromJob(job) {
  const req = job.requirements;
  const text = (value) => (value == null ? '' : String(value));
  return {
    title: job.title,
    department: job.department,
    bps: text(job.bps),
    location: job.location,
    employmentType: job.employmentType,
    vacancies: text(job.vacancies),
    requisitionRef: text(job.requisitionRef),
    summary: job.summary,
    description: job.description,
    openingDate: dayOf(job.openingDate),
    closingDate: dayOf(job.closingDate),
    ageCutoffDate: text(job.ageCutoffDate),
    fee: text(job.fee),
    minQualification: req.minQualification,
    minMarksPercent: text(req.minMarksPercent),
    experienceYears: text(req.experienceYears),
    ageMin: text(req.ageMin),
    ageMax: text(req.ageMax),
    domicileProvinces: req.domicileProvinces,
    documents: req.documents,
    quotas: job.quotas.map((q) => ({ category: q.category, seats: text(q.seats) })),
  };
}

const num = (value) => (value === '' ? null : Number(value));

export function payloadFromForm(form) {
  return {
    title: form.title.trim(),
    department: form.department,
    bps: num(form.bps),
    location: form.location.trim(),
    employmentType: form.employmentType,
    vacancies: num(form.vacancies),
    requisitionRef: form.requisitionRef.trim() || null,
    summary: form.summary.trim(),
    description: form.description.trim(),
    openingDate: form.openingDate && `${form.openingDate}T00:00:00${PKT}`,
    closingDate: form.closingDate && `${form.closingDate}T23:59:59${PKT}`,
    ageCutoffDate: form.ageCutoffDate || null,
    fee: num(form.fee) ?? 0,
    requirements: {
      minQualification: form.minQualification,
      minMarksPercent: num(form.minMarksPercent),
      experienceYears: num(form.experienceYears) ?? 0,
      ageMin: num(form.ageMin),
      ageMax: num(form.ageMax),
      domicileProvinces: form.domicileProvinces,
      documents: form.documents,
    },
    quotas: form.quotas.map((q) => ({ category: q.category, seats: num(q.seats) })),
  };
}

const REQUIRED = [
  'title',
  'department',
  'bps',
  'location',
  'vacancies',
  'summary',
  'description',
  'openingDate',
  'closingDate',
  'minQualification',
  'ageMin',
  'ageMax',
];

/** Errors keyed like the form fields; empty when the form can be sent. */
export function validateForm(form) {
  const errors = {};
  for (const key of REQUIRED) {
    if (String(form[key]).trim() === '') errors[key] = t('validation.required');
  }
  if (form.openingDate && form.closingDate && form.closingDate < form.openingDate) {
    errors.closingDate = t('adminJobs.form.errors.closingAfterOpening');
  }
  if (form.ageMin && form.ageMax && Number(form.ageMax) < Number(form.ageMin)) {
    errors.ageMax = t('adminJobs.form.errors.ageRange');
  }
  const categories = form.quotas.map((q) => q.category);
  const seats = form.quotas.reduce((sum, q) => sum + (Number(q.seats) || 0), 0);
  if (new Set(categories).size !== categories.length) {
    errors.quotas = t('adminJobs.form.errors.quotaDuplicate');
  } else if (form.vacancies && seats !== Number(form.vacancies)) {
    errors.quotas = t('adminJobs.form.errors.quotaTotal');
  }
  return errors;
}

/** Maps API validation `fields` (payload names) onto form field names. */
export function errorsFromApi(fields = {}) {
  const errors = {};
  for (const [key, messages] of Object.entries(fields)) {
    const message = Array.isArray(messages)
      ? messages.join(' ')
      : t('adminJobs.form.errors.fixFields');
    if (key === 'requirements' && typeof messages === 'object' && !Array.isArray(messages)) {
      Object.assign(errors, errorsFromApi(messages));
    } else {
      errors[key] = message;
    }
  }
  return errors;
}
