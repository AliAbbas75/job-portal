import { Link } from 'react-router-dom';
import { SelectField } from '../../../components/forms/SelectField';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { isBlank } from '../../../utils/validators';
import { SectionForm } from './SectionForm';

function validate(draft) {
  const errors = {};
  if (isBlank(draft.province)) errors.province = t('validation.required');
  if (isBlank(draft.district)) errors.district = t('validation.required');
  return errors;
}

export function DomicileSection({ profile, reference, onSaved }) {
  const provinces = reference?.provinces ?? [];

  return (
    <SectionForm
      section="domicile"
      initial={profile.domicile}
      onSaved={onSaved}
      validate={validate}
    >
      {({ draft, setDraft, errors }) => {
        const districts = provinces.find((p) => p.code === draft.province)?.districts ?? [];
        return (
          <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
              <SelectField
                label={t('fields.province')}
                placeholder={t('common.select')}
                options={provinces.map((p) => ({ value: p.code, label: p.name }))}
                value={draft.province}
                onChange={(province) => setDraft({ province, district: '' })}
                error={errors.province}
                required
              />
              <SelectField
                label={t('fields.district')}
                placeholder={draft.province ? t('common.select') : t('profile.pickProvinceFirst')}
                options={districts.map((d) => ({ value: d, label: d }))}
                value={draft.district}
                onChange={(district) => setDraft((d) => ({ ...d, district }))}
                error={errors.district}
                disabled={!draft.province}
                required
              />
            </div>
            <p>
              {t('profile.domicileCertificate')}{' '}
              <Link to={paths.profileSection('documents')}>{t('profile.sections.documents')}</Link>
            </p>
          </>
        );
      }}
    </SectionForm>
  );
}
