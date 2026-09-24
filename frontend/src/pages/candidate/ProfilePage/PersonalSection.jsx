import { Alert } from '../../../components/common/Alert';
import { SelectField } from '../../../components/forms/SelectField';
import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { isBlank } from '../../../utils/validators';
import styles from './ProfilePage.module.css';
import { SectionForm } from './SectionForm';

const today = () => new Date().toISOString().slice(0, 10);

function validate(draft) {
  const errors = {};
  if (isBlank(draft.fullName)) errors.fullName = t('validation.required');
  if (isBlank(draft.fatherName)) errors.fatherName = t('validation.required');
  if (isBlank(draft.dob)) errors.dob = t('validation.required');
  else if (draft.dob > today()) errors.dob = t('validation.dobFuture');
  if (isBlank(draft.gender)) errors.gender = t('validation.required');
  return errors;
}

export function PersonalSection({ profile, reference, onSaved }) {
  return (
    <SectionForm
      section="personal"
      initial={profile.personal}
      onSaved={onSaved}
      validate={validate}
    >
      {({ draft, setField, errors }) => (
        <>
          <div className={styles.grid}>
            <TextField
              label={t('fields.fullName')}
              autoComplete="name"
              value={draft.fullName}
              onChange={(e) => setField('fullName')(e.target.value)}
              error={errors.fullName}
              required
            />
            <TextField
              label={t('fields.fatherName')}
              value={draft.fatherName}
              onChange={(e) => setField('fatherName')(e.target.value)}
              error={errors.fatherName}
              required
            />
            <TextField
              label={t('fields.cnic')}
              value={draft.cnic}
              readOnly
              hint={t('profile.cnicFixed')}
            />
            <TextField
              label={t('fields.dob')}
              type="date"
              max={today()}
              value={draft.dob}
              onChange={(e) => setField('dob')(e.target.value)}
              error={errors.dob}
              required
            />
            <SelectField
              label={t('fields.gender')}
              placeholder={t('common.select')}
              options={(reference?.genders ?? []).map((g) => ({ value: g.code, label: g.name }))}
              value={draft.gender}
              onChange={(e) => setField('gender')(e.target.value)}
              error={errors.gender}
              required
            />
            <TextField
              label={t('fields.nationality')}
              value={draft.nationality}
              onChange={(e) => setField('nationality')(e.target.value)}
            />
          </div>
          <Alert variant="info">{t('profile.ageNote')}</Alert>
        </>
      )}
    </SectionForm>
  );
}
