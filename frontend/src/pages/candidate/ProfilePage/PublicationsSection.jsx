import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { isBlank } from '../../../utils/validators';
import { ListSection } from './ListSection';

const EMPTY = { title: '', venue: null, year: null, url: null };
const thisYear = new Date().getFullYear();

function validate(draft) {
  const errors = {};
  if (isBlank(draft.title)) errors.title = t('validation.required');
  const year = Number(draft.year);
  if (!isBlank(draft.year) && (!Number.isInteger(year) || year < 1950 || year > thisYear)) {
    errors.year = t('validation.year');
  }
  return errors;
}

/** BPS-15+: publications and research (T-056). */
export function PublicationsSection({ profile, onSaved, suggestions, lowConfidence }) {
  return (
    <ListSection
      section="publications"
      items={profile.publications ?? []}
      emptyItem={EMPTY}
      validate={validate}
      onSaved={onSaved}
      suggestions={suggestions}
      lowConfidence={lowConfidence}
      labels={{
        add: t('resume.publications.add'),
        edit: t('resume.publications.edit'),
        empty: t('resume.publications.empty'),
      }}
      summarize={(item) => ({
        title: item.title,
        subtitle: [item.venue, item.year].filter(Boolean).join(', '),
      })}
      renderFields={({ draft, setField, errors }) => (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <TextField
            label={t('resume.publications.title')}
            value={draft.title}
            onChange={(e) => setField('title')(e.target.value)}
            error={errors.title}
            required
          />
          <TextField
            label={t('resume.publications.venue')}
            value={draft.venue ?? ''}
            onChange={(e) => setField('venue')(e.target.value || null)}
          />
          <TextField
            label={t('resume.publications.year')}
            type="number"
            inputMode="numeric"
            value={draft.year ?? ''}
            onChange={(e) => setField('year')(e.target.value ? Number(e.target.value) : null)}
            error={errors.year}
          />
          <TextField
            label={t('resume.publications.url')}
            type="url"
            value={draft.url ?? ''}
            onChange={(e) => setField('url')(e.target.value || null)}
          />
        </div>
      )}
    />
  );
}
