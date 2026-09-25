// The one-page profile form (My profile page and apply wizard step 3): profile JSON ↔ form
// values ↔ PUT /profile/summary payload.
import { t } from '../i18n';
import { isBlank, isValidEmail } from './validators';

const REQUIRED = [
  'fullName',
  'fatherName',
  'dob',
  'gender',
  'province',
  'district',
  'address',
  'highestQualification',
  'tradeCertificate',
  'quota',
  'ageRelaxation',
];

export function formFromProfile(profile) {
  return {
    fullName: profile.personal.fullName,
    fatherName: profile.personal.fatherName,
    dob: profile.personal.dob,
    gender: profile.personal.gender,
    province: profile.domicile.province,
    district: profile.domicile.district,
    email: profile.contact.email,
    address: profile.contact.currentAddress,
    highestQualification: profile.claims?.highestQualification ?? '',
    tradeCertificate: profile.claims?.tradeCertificate ?? '',
    quota: profile.claims?.quota ?? '',
    ageRelaxation: profile.claims?.ageRelaxation ?? '',
  };
}

export const payloadFromForm = (form) => ({ ...form, email: form.email || null });

/** Field errors, empty when the form can be saved. */
export function validateProfileForm(form) {
  const errors = {};
  for (const key of REQUIRED) if (isBlank(form[key])) errors[key] = t('validation.required');
  if (form.dob && new Date(form.dob) > new Date()) errors.dob = t('validation.dobFuture');
  if (!isBlank(form.email) && !isValidEmail(form.email)) errors.email = t('validation.email');
  return errors;
}

/** API validation `fields` ({ field: [messages] }) → { field: message }. */
export function errorsFromApi(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, messages]) => [key, [messages].flat().join(' ')]),
  );
}
