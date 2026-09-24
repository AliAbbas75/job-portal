import { CheckboxField } from '../../../components/forms/CheckboxField';
import { t } from '../../../i18n';
import { SectionForm } from './SectionForm';

const OPTIONS = ['governmentEmployee', 'disability', 'minority'];

export function AdditionalSection({ profile, onSaved }) {
  return (
    <SectionForm section="additional" initial={profile.additional} onSaved={onSaved}>
      {({ draft, setField }) => (
        <>
          <p>{t('profile.additionalLead')}</p>
          {OPTIONS.map((option) => (
            <CheckboxField
              key={option}
              label={t(`profile.additional.${option}`)}
              description={draft[option] ? t(`profile.additional.${option}Note`) : undefined}
              checked={draft[option]}
              onChange={(e) => setField(option)(e.target.checked)}
            />
          ))}
        </>
      )}
    </SectionForm>
  );
}
