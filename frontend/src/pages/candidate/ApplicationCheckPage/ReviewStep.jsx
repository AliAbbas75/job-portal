import { Link } from 'react-router-dom';
import { Alert } from '../../../components/common/Alert';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { documentName, provinceName, qualificationName } from '../../../utils/referenceLabels';

const nameIn = (list, code) => list?.find((item) => item.code === code)?.name ?? code ?? '-';

function Summary({ title, rows }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-surface bg-cream p-4">
      <h3 className="border-b border-surface pb-1.5 text-sm text-black">{title}</h3>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="inline">{label}: </dt>
            <dd className="inline font-bold">{value || '-'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Wizard step 5: what will be submitted, and anything that still blocks it. */
export function ReviewStep({ identity, profile, documents, check, reference }) {
  const claims = profile.claims ?? {};
  const blocking = check.items.filter((item) => item.status === 'not_met');
  const missing = check.items.filter((item) => item.status === 'missing');
  const itemLabel = (item) =>
    item.key === 'document'
      ? documentName(reference, item.documentType)
      : t(`wizard.checkItem.${item.key}`);
  const fixLink = (item) =>
    item.key === 'document' || item.fix === 'education' || item.fix === 'experience'
      ? `${paths.profile}#${item.key === 'document' ? 'documents' : item.fix}`
      : paths.profile;

  return (
    <div className="flex flex-col gap-4">
      <Summary
        title={t('wizard.identity')}
        rows={[
          [t('profileForm.cnic'), identity?.cnic ?? profile.personal.cnic],
          [t('profileForm.mobile'), profile.contact.mobile],
        ]}
      />
      <Summary
        title={t('wizard.profile')}
        rows={[
          [t('profileForm.fullName'), profile.personal.fullName],
          [t('profileForm.fatherName'), profile.personal.fatherName],
          [t('profileForm.dob'), profile.personal.dob],
          [t('profileForm.gender'), nameIn(reference.genders, profile.personal.gender)],
          [t('profileForm.province'), provinceName(reference, profile.domicile.province)],
          [t('profileForm.district'), profile.domicile.district],
          [t('profileForm.address'), profile.contact.currentAddress],
          [
            t('profileForm.highestEducation'),
            qualificationName(reference, claims.highestQualification),
          ],
          [
            t('profileForm.tradeCertificate'),
            nameIn(reference.tradeCertificates, claims.tradeCertificate),
          ],
          [t('profileForm.quota'), nameIn(reference.quotaClaims, claims.quota)],
          [t('profileForm.ageRelaxation'), nameIn(reference.ageRelaxations, claims.ageRelaxation)],
        ]}
      />
      <Summary
        title={t('wizard.documents')}
        rows={[[t('wizard.documents'), t('wizard.documentsCount', { count: documents.length })]]}
      />

      {blocking.length > 0 && (
        <Alert variant="error" title={t('wizard.notEligibleTitle')}>
          {t('wizard.notEligible')} {blocking.map(itemLabel).join(', ')}
        </Alert>
      )}
      {blocking.length === 0 && missing.length > 0 && (
        <Alert variant="warning" title={t('wizard.stillMissing')}>
          <ul className="list-disc pl-5">
            {missing.map((item) => (
              <li key={item.documentType ?? item.key}>
                {itemLabel(item)} · <Link to={fixLink(item)}>{t('wizard.addInProfile')}</Link>
              </li>
            ))}
          </ul>
        </Alert>
      )}
      {check.complete && check.eligible && <Alert variant="success">{t('wizard.eligible')}</Alert>}

      <p className="rounded-sm border border-gold bg-cream p-3 text-sm">
        <strong>{t('wizard.disclaimerLabel')}</strong> {t('wizard.disclaimer')}
      </p>
    </div>
  );
}
