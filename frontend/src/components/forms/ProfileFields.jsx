import { t } from '../../i18n';
import { ageOn } from '../../utils/age';
import { SelectField } from './SelectField';
import { TextField } from './TextField';

/**
 * Personal details, then "Education and quota" (design: Malaika). Used on My profile and in the
 * apply wizard. `form` values come from utils/profileForm.js; setForm is a state setter.
 */
export function ProfileFields({ form, setForm, errors, reference, headingClass }) {
  const set = (key) => (value) =>
    setForm((f) => ({ ...f, [key]: value, ...(key === 'province' ? { district: '' } : {}) }));
  const text = (key) => ({
    value: form[key] ?? '',
    onChange: (event) => set(key)(event.target.value),
    error: errors[key],
  });
  const select = (key, list) => ({
    options: (list ?? []).map((item) => ({ value: item.code, label: item.name })),
    placeholder: t('profileForm.select'),
    value: form[key] ?? '',
    onChange: set(key),
    error: errors[key],
  });
  const districts = (
    reference.provinces.find((p) => p.code === form.province)?.districts ?? []
  ).map((name) => ({ code: name, name }));
  const age = form.dob ? ageOn(form.dob) : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <TextField label={t('profileForm.fullName')} required {...text('fullName')} />
        <TextField label={t('profileForm.fatherName')} required {...text('fatherName')} />
        <TextField label={t('profileForm.dob')} type="date" required {...text('dob')} />
        <TextField
          label={t('profileForm.age')}
          value={age == null ? '' : t('profileForm.ageValue', { count: age })}
          readOnly
        />
        <SelectField
          label={t('profileForm.gender')}
          required
          {...select('gender', reference.genders)}
        />
        <SelectField
          label={t('profileForm.province')}
          required
          {...select('province', reference.provinces)}
        />
        <SelectField
          label={t('profileForm.district')}
          required
          {...select('district', districts)}
        />
        <TextField
          label={t('profileForm.email')}
          hint={t('profileForm.optional')}
          type="email"
          {...text('email')}
        />
      </div>
      <TextField
        label={t('profileForm.address')}
        placeholder={t('profileForm.addressPlaceholder')}
        multiline
        rows={2}
        required
        {...text('address')}
      />
      {headingClass && <h2 className={headingClass}>{t('profileForm.educationTitle')}</h2>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SelectField
          label={t('profileForm.highestEducation')}
          required
          {...select('highestQualification', reference.qualificationLevels)}
        />
        <SelectField
          label={t('profileForm.tradeCertificate')}
          required
          {...select('tradeCertificate', reference.tradeCertificates)}
        />
        <SelectField
          label={t('profileForm.quota')}
          required
          {...select('quota', reference.quotaClaims)}
        />
        <SelectField
          label={t('profileForm.ageRelaxation')}
          hint={t('profileForm.ageRelaxationHint')}
          required
          {...select('ageRelaxation', reference.ageRelaxations)}
        />
      </div>
    </>
  );
}
