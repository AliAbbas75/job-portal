import { useState } from 'react';
import { updateProfileSection } from '../../../api/profile';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { SelectField } from '../../../components/forms/SelectField';
import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { errorMessage } from '../../../utils/errorMessage';
import { isBlank, isValidEmail } from '../../../utils/validators';

const PERSONAL = ['fullName', 'fatherName', 'dob'];
const CONTACT = ['email', 'currentAddress'];

/**
 * T-054: the personal and contact values read from the resume, shown next to the profile's own
 * values so the candidate can correct them before saving. Nothing is saved until they confirm.
 */
export function DetailsReview({ profile, suggestions, lowConfidence, reference, onSaved }) {
  const suggested = { ...suggestions.personal, ...suggestions.contact };
  const current = { ...profile.personal, ...profile.contact };
  const [form, setForm] = useState(() =>
    Object.fromEntries(
      [...PERSONAL, ...CONTACT, 'gender'].map((key) => [
        key,
        suggested[key]?.value ?? current[key] ?? '',
      ]),
    ),
  );
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  // A group is shown whole once the resume suggests any of its values.
  const showPersonal = PERSONAL.some((key) => suggested[key]);
  const showContact = CONTACT.some((key) => suggested[key]);
  const fields = [...(showPersonal ? PERSONAL : []), ...(showContact ? CONTACT : [])];
  if (fields.length === 0) return <p>{t('resume.details.none')}</p>;

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const hint = (key) =>
    suggested[key]?.confidence < lowConfidence ? t('resume.checkThisHint') : undefined;
  const changed = (keys) => keys.some((key) => form[key] !== (current[key] ?? ''));

  function validate() {
    const found = {};
    if (showPersonal) {
      for (const key of [...PERSONAL, 'gender']) {
        if (isBlank(form[key])) found[key] = t('validation.required');
      }
    }
    if (form.dob && form.dob > new Date().toISOString().slice(0, 10)) {
      found.dob = t('validation.dobFuture');
    }
    if (!isBlank(form.email) && !isValidEmail(form.email)) found.email = t('validation.email');
    if (showContact && changed(CONTACT) && isBlank(form.currentAddress)) {
      found.currentAddress = t('validation.required');
    }
    return found;
  }

  async function save(event) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    setStatus(null);
    try {
      let saved = profile;
      if (showPersonal && changed([...PERSONAL, 'gender'])) {
        saved = await updateProfileSection('personal', {
          fullName: form.fullName,
          fatherName: form.fatherName,
          dob: form.dob,
          gender: form.gender,
          nationality: profile.personal.nationality || undefined,
        });
      }
      if (showContact && changed(CONTACT)) {
        saved = await updateProfileSection('contact', {
          email: isBlank(form.email) ? null : form.email,
          currentAddress: form.currentAddress,
          permanentAddress: profile.contact.permanentAddress || form.currentAddress,
        });
      }
      onSaved(saved);
      setStatus({ saved: true });
    } catch (err) {
      setStatus({ error: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={save} noValidate>
      <p className="text-sm">{t('resume.details.lead')}</p>
      {status?.saved && <Alert variant="success">{t('profile.saved')}</Alert>}
      {status?.error && <Alert variant="error">{status.error}</Alert>}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {fields.map((key) => (
          <TextField
            key={key}
            label={t(`resume.details.${key}`)}
            type={key === 'dob' ? 'date' : 'text'}
            multiline={key === 'currentAddress'}
            value={form[key]}
            onChange={(e) => set(key)(e.target.value)}
            hint={hint(key)}
            error={errors[key]}
            required={PERSONAL.includes(key)}
          />
        ))}
        {showPersonal && isBlank(current.gender) && (
          <SelectField
            label={t('profileForm.gender')}
            required
            options={(reference.genders ?? []).map((g) => ({ value: g.code, label: g.name }))}
            placeholder={t('profileForm.select')}
            value={form.gender}
            onChange={set('gender')}
            error={errors.gender}
          />
        )}
      </div>
      <div>
        <Button type="submit" loading={busy}>
          {t('resume.details.confirm')}
        </Button>
      </div>
    </form>
  );
}
