import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';
import { documentName, provinceName, qualificationName } from '../../../utils/referenceLabels';
import styles from './JobDetailsPage.module.css';

export function Requirements({ job, reference }) {
  const req = job.requirements;
  const rows = [
    {
      label: t('job.req.education'),
      value: req.minMarksPercent
        ? t('job.req.educationWithMarks', {
            level: qualificationName(reference, req.minQualification),
            marks: req.minMarksPercent,
          })
        : t('job.req.educationValue', {
            level: qualificationName(reference, req.minQualification),
          }),
    },
    {
      label: t('job.req.experience'),
      value: req.experienceYears
        ? t('job.req.experienceValue', { count: req.experienceYears })
        : t('job.req.experienceNone'),
    },
    {
      label: t('job.req.age'),
      value: t('job.req.ageValue', { min: req.ageMin, max: req.ageMax }),
    },
    {
      label: t('job.req.domicile'),
      value: req.domicileProvinces.length
        ? req.domicileProvinces.map((code) => provinceName(reference, code)).join(', ')
        : t('job.req.domicileAny'),
    },
  ];

  return (
    <>
      <section className={styles.section}>
        <h2>{t('job.eligibilityHeading')}</h2>
        <dl className={styles.requirements}>
          {rows.map((row) => (
            <div key={row.label} className={styles.requirement}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.note}>{t('job.req.ageNote')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('job.documentsHeading')}</h2>
        <ul className={styles.documents}>
          {req.documents.map((code) => (
            <li key={code}>
              <Icon name="file" size={18} />
              {documentName(reference, code)}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
