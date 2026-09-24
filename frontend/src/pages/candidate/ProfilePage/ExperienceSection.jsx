import { CheckboxField } from '../../../components/forms/CheckboxField';
import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { formatDate } from '../../../utils/format';
import { isBlank } from '../../../utils/validators';
import { ListSection } from './ListSection';

const EMPTY = { organization: '', designation: '', startDate: '', endDate: '', current: false };
const today = () => new Date().toISOString().slice(0, 10);

function validate(draft) {
  const errors = {};
  for (const field of ['organization', 'designation', 'startDate']) {
    if (isBlank(draft[field])) errors[field] = t('validation.required');
  }
  if (!draft.current) {
    if (isBlank(draft.endDate)) errors.endDate = t('validation.required');
    else if (draft.startDate && draft.endDate < draft.startDate)
      errors.endDate = t('validation.endBeforeStart');
  }
  return errors;
}

export function ExperienceSection({ profile, onSaved }) {
  return (
    <>
      <p>{t('profile.experience.lead')}</p>
      <ListSection
        section="experience"
        items={profile.experience}
        emptyItem={EMPTY}
        validate={validate}
        onSaved={onSaved}
        labels={{
          add: t('profile.experience.add'),
          edit: t('profile.experience.edit'),
          empty: t('profile.experience.empty'),
        }}
        summarize={(item) => ({
          title: `${item.designation} · ${item.organization}`,
          subtitle: `${formatDate(item.startDate)} – ${item.current ? t('profile.experience.present') : formatDate(item.endDate)}`,
        })}
        renderFields={({ draft, setField, errors }) => (
          <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
              <TextField
                label={t('fields.organization')}
                value={draft.organization}
                onChange={(e) => setField('organization')(e.target.value)}
                error={errors.organization}
                required
              />
              <TextField
                label={t('fields.designation')}
                value={draft.designation}
                onChange={(e) => setField('designation')(e.target.value)}
                error={errors.designation}
                required
              />
              <TextField
                label={t('fields.startDate')}
                type="date"
                max={today()}
                value={draft.startDate}
                onChange={(e) => setField('startDate')(e.target.value)}
                error={errors.startDate}
                required
              />
              <TextField
                label={t('fields.endDate')}
                type="date"
                max={today()}
                value={draft.current ? '' : draft.endDate}
                onChange={(e) => setField('endDate')(e.target.value)}
                error={errors.endDate}
                disabled={draft.current}
                required={!draft.current}
              />
            </div>
            <CheckboxField
              label={t('profile.experience.current')}
              checked={draft.current}
              onChange={(e) => setField('current')(e.target.checked)}
            />
          </>
        )}
      />
    </>
  );
}
