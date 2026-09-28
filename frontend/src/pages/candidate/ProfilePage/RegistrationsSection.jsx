import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { formatDate } from '../../../utils/format';
import { isBlank } from '../../../utils/validators';
import { ListSection } from './ListSection';

const EMPTY = { body: '', registrationNo: '', validUntil: null };

function validate(draft) {
  const errors = {};
  if (isBlank(draft.body)) errors.body = t('validation.required');
  if (isBlank(draft.registrationNo)) errors.registrationNo = t('validation.required');
  return errors;
}

/** BPS-15+: professional registrations, e.g. PEC for engineering posts (T-056). */
export function RegistrationsSection({ profile, onSaved, suggestions, lowConfidence }) {
  return (
    <ListSection
      section="registrations"
      items={profile.registrations ?? []}
      emptyItem={EMPTY}
      validate={validate}
      onSaved={onSaved}
      suggestions={suggestions}
      lowConfidence={lowConfidence}
      labels={{
        add: t('resume.registrations.add'),
        edit: t('resume.registrations.edit'),
        empty: t('resume.registrations.empty'),
      }}
      summarize={(item) => ({
        title: `${item.body} · ${item.registrationNo}`,
        subtitle: item.validUntil
          ? t('resume.registrations.validUntil', { date: formatDate(item.validUntil) })
          : '',
      })}
      renderFields={({ draft, setField, errors }) => (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <TextField
            label={t('resume.registrations.body')}
            placeholder={t('resume.registrations.bodyPlaceholder')}
            value={draft.body}
            onChange={(e) => setField('body')(e.target.value)}
            error={errors.body}
            required
          />
          <TextField
            label={t('resume.registrations.number')}
            value={draft.registrationNo}
            onChange={(e) => setField('registrationNo')(e.target.value)}
            error={errors.registrationNo}
            required
          />
          <TextField
            label={t('resume.registrations.validUntilLabel')}
            type="date"
            value={draft.validUntil ?? ''}
            onChange={(e) => setField('validUntil')(e.target.value || null)}
          />
        </div>
      )}
    />
  );
}
