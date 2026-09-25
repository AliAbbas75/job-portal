import { useState } from 'react';
import { updateProfile } from '../../../api/profile';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { ProfileFields } from '../../../components/forms/ProfileFields';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { errorMessage } from '../../../utils/errorMessage';
import {
  errorsFromApi,
  formFromProfile,
  payloadFromForm,
  validateProfileForm,
} from '../../../utils/profileForm';
import { ProfilePicture } from './ProfilePicture';

const HEADING = 'border-b border-surface pb-2 text-base text-black';

/** The "My profile" card (design: Malaika). onSaved(profile). */
export function ProfileForm({ profile, reference, documents, onSaved, onDocumentsChange }) {
  const [form, setForm] = useState(() => formFromProfile(profile));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  async function save(event) {
    event.preventDefault();
    const found = validateProfileForm(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus({ error: { code: 'validation_error' } });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      onSaved(await updateProfile(payloadFromForm(form)));
      setStatus({ saved: true });
    } catch (err) {
      setErrors(errorsFromApi(err.fields));
      setStatus({ error: err });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={save}
      noValidate
      className="flex flex-col gap-8 rounded-md border border-heritage bg-white p-6 md:p-8"
    >
      {status?.saved && <Alert variant="success">{t('profileForm.saved')}</Alert>}
      {status?.error && <Alert variant="error">{errorMessage(status.error)}</Alert>}

      <ProfilePicture name={form.fullName} documents={documents} onChange={onDocumentsChange} />

      <section className="flex flex-col gap-3">
        <h2 className={HEADING}>{t('profileForm.contactTitle')}</h2>
        <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          {[
            ['cnic', profile.personal.cnic],
            ['mobile', profile.contact.mobile],
          ].map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-4 rounded-sm border border-surface bg-cream p-3"
            >
              <dt>{t(`profileForm.${key}`)}</dt>
              <dd className="font-mono font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className={HEADING}>{t('profileForm.personalTitle')}</h2>
        <ProfileFields
          form={form}
          setForm={setForm}
          errors={errors}
          reference={reference}
          headingClass={HEADING}
        />
      </section>

      <div className="flex flex-wrap items-center gap-4 border-t border-surface pt-4">
        <Button type="submit" size="lg" loading={busy}>
          {t('profileForm.save')}
        </Button>
        <Button to={paths.applications} variant="secondary" size="lg">
          {t('profileForm.back')}
        </Button>
      </div>
    </form>
  );
}
