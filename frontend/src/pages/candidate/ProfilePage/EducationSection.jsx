import { SelectField } from '../../../components/forms/SelectField';
import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { qualificationName } from '../../../utils/referenceLabels';
import { isBlank } from '../../../utils/validators';
import { ListSection } from './ListSection';

const EMPTY = { level: '', discipline: '', institution: '', year: '', marksPercent: '' };
const thisYear = new Date().getFullYear();

function validate(draft) {
  const errors = {};
  for (const field of ['level', 'discipline', 'institution']) {
    if (isBlank(draft[field])) errors[field] = t('validation.required');
  }
  const year = Number(draft.year);
  if (!Number.isInteger(year) || year < 1950 || year > thisYear) errors.year = t('validation.year');
  const marks = Number(draft.marksPercent);
  if (isBlank(draft.marksPercent) || marks < 0 || marks > 100)
    errors.marksPercent = t('validation.percent');
  return errors;
}

export function EducationSection({ profile, reference, onSaved }) {
  return (
    <ListSection
      section="education"
      items={profile.education}
      emptyItem={EMPTY}
      validate={validate}
      onSaved={onSaved}
      labels={{
        add: t('profile.education.add'),
        edit: t('profile.education.edit'),
        empty: t('profile.education.empty'),
      }}
      summarize={(item) => ({
        title: `${qualificationName(reference, item.level)} · ${item.discipline}`,
        subtitle: t('profile.education.summary', {
          institution: item.institution,
          year: item.year,
          marks: item.marksPercent,
        }),
      })}
      renderFields={({ draft, setField, errors }) => (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <SelectField
            label={t('fields.qualification')}
            placeholder={t('common.select')}
            options={(reference?.qualificationLevels ?? []).map((l) => ({
              value: l.code,
              label: l.name,
            }))}
            value={draft.level}
            onChange={setField('level')}
            error={errors.level}
            required
          />
          <TextField
            label={t('fields.discipline')}
            placeholder={t('profile.education.disciplinePlaceholder')}
            value={draft.discipline}
            onChange={(e) => setField('discipline')(e.target.value)}
            error={errors.discipline}
            required
          />
          <TextField
            label={t('fields.institution')}
            value={draft.institution}
            onChange={(e) => setField('institution')(e.target.value)}
            error={errors.institution}
            required
          />
          <TextField
            label={t('fields.passingYear')}
            type="number"
            inputMode="numeric"
            min={1950}
            max={thisYear}
            value={draft.year}
            onChange={(e) => setField('year')(e.target.value)}
            error={errors.year}
            required
          />
          <TextField
            label={t('fields.marksPercent')}
            hint={t('profile.education.marksHint')}
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            value={draft.marksPercent}
            onChange={(e) => setField('marksPercent')(e.target.value)}
            error={errors.marksPercent}
            required
          />
        </div>
      )}
    />
  );
}
