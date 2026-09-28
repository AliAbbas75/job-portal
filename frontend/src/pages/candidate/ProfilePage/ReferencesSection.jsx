import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { isBlank, isValidEmail } from '../../../utils/validators';
import { ListSection } from './ListSection';

const EMPTY = { name: '', designation: null, organization: null, phone: null, email: null };

function validate(draft) {
  const errors = {};
  if (isBlank(draft.name)) errors.name = t('validation.required');
  if (!isBlank(draft.email) && !isValidEmail(draft.email)) errors.email = t('validation.email');
  return errors;
}

// Optional fields are sent as null when empty.
const orNull = (value) => (isBlank(value) ? null : value);

/** BPS-15+: references (T-056). */
export function ReferencesSection({ profile, onSaved, suggestions, lowConfidence }) {
  return (
    <ListSection
      section="references"
      items={profile.references ?? []}
      emptyItem={EMPTY}
      validate={validate}
      onSaved={onSaved}
      suggestions={suggestions}
      lowConfidence={lowConfidence}
      labels={{
        add: t('resume.references.add'),
        edit: t('resume.references.edit'),
        empty: t('resume.references.empty'),
      }}
      summarize={(item) => ({
        title: item.name,
        subtitle: [item.designation, item.organization, item.email, item.phone]
          .filter(Boolean)
          .join(' · '),
      })}
      renderFields={({ draft, setField, errors }) => (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <TextField
            label={t('resume.references.name')}
            value={draft.name}
            onChange={(e) => setField('name')(e.target.value)}
            error={errors.name}
            required
          />
          {['designation', 'organization', 'phone', 'email'].map((key) => (
            <TextField
              key={key}
              label={t(`resume.references.${key}`)}
              type={key === 'email' ? 'email' : 'text'}
              value={draft[key] ?? ''}
              onChange={(e) => setField(key)(orNull(e.target.value))}
              error={errors[key]}
            />
          ))}
        </div>
      )}
    />
  );
}
