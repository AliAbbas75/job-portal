import { Icon } from './Icon';
import { t } from '../../i18n';
import { documentName, provinceName, qualificationName } from '../../utils/referenceLabels';

/** A job's structured eligibility rules as a list. Used on the public and staff job pages. */
export function JobRequirements({ job, reference }) {
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
      <section className="flex flex-col gap-3 [&>h2]:text-xl">
        <h2>{t('job.eligibilityHeading')}</h2>
        <dl className="rounded-md border border-heritage">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-1 border-dashed border-heritage px-4 py-3 not-first:border-t md:grid-cols-[160px_1fr] md:gap-4 [&_dt]:font-bold [&_dt]:text-heritage"
            >
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm">{t('job.req.ageNote')}</p>
      </section>

      <section className="flex flex-col gap-3 [&>h2]:text-xl">
        <h2>{t('job.documentsHeading')}</h2>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2 [&_li]:flex [&_li]:items-center [&_li]:gap-2 [&_li]:rounded-sm [&_li]:bg-surface [&_li]:px-3 [&_li]:py-2 [&_svg]:flex-none [&_svg]:text-heritage">
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
