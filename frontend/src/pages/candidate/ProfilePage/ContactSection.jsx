import { CheckboxField } from '../../../components/forms/CheckboxField';
import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { isBlank, isValidEmail } from '../../../utils/validators';
import { SectionForm } from './SectionForm';

function validate(draft) {
  const errors = {};
  if (draft.email && !isValidEmail(draft.email)) errors.email = t('validation.email');
  if (isBlank(draft.currentAddress)) errors.currentAddress = t('validation.required');
  if (isBlank(draft.permanentAddress)) errors.permanentAddress = t('validation.required');
  return errors;
}

export function ContactSection({ profile, onSaved }) {
  return (
    <SectionForm section="contact" initial={profile.contact} onSaved={onSaved} validate={validate}>
      {({ draft, setField, setDraft, errors }) => {
        const sameAddress =
          Boolean(draft.currentAddress) && draft.currentAddress === draft.permanentAddress;
        return (
          <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
              <TextField
                label={t('fields.mobile')}
                value={draft.mobile}
                readOnly
                hint={t('profile.mobileFixed')}
              />
              <TextField
                label={t('fields.email')}
                type="email"
                autoComplete="email"
                hint={t('fields.optional')}
                value={draft.email}
                onChange={(e) => setField('email')(e.target.value)}
                error={errors.email}
              />
            </div>
            <TextField
              label={t('fields.currentAddress')}
              multiline
              autoComplete="street-address"
              value={draft.currentAddress}
              onChange={(e) => setField('currentAddress')(e.target.value)}
              error={errors.currentAddress}
              required
            />
            <CheckboxField
              label={t('profile.sameAddress')}
              checked={sameAddress}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  permanentAddress: e.target.checked ? d.currentAddress : '',
                }))
              }
            />
            <TextField
              label={t('fields.permanentAddress')}
              multiline
              value={draft.permanentAddress}
              onChange={(e) => setField('permanentAddress')(e.target.value)}
              error={errors.permanentAddress}
              required
            />
          </>
        );
      }}
    </SectionForm>
  );
}
