import { Link } from 'react-router-dom';
import { useReferenceData } from '../../hooks/useReferenceData';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { cx } from '../../utils/cx';
import { daysUntil, formatDate } from '../../utils/format';
import { jobCode } from '../../utils/jobCode';
import { qualificationName } from '../../utils/referenceLabels';
import { Button } from './Button';

/**
 * Open jobs as a table (Figma "Available Jobs"). Rows closing within 7 days are tinted red.
 * Scrolls sideways on narrow screens.
 */
export function JobsTable({ jobs, caption }) {
  const { data: ref } = useReferenceData();

  return (
    <div className="overflow-x-auto rounded-md border border-heritage">
      <table className="w-full min-w-[56rem] border-collapse text-sm [&_td]:border-b [&_td]:border-surface [&_td]:px-3 [&_td]:py-3 [&_th]:bg-surface [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-bold [&_th]:text-heritage">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            <th scope="col">{t('jobs.table.id')}</th>
            <th scope="col">{t('jobs.table.title')}</th>
            <th scope="col">{t('jobs.table.scale')}</th>
            <th scope="col">{t('jobs.table.department')}</th>
            <th scope="col">{t('jobs.table.location')}</th>
            <th scope="col">{t('jobs.table.positions')}</th>
            <th scope="col">{t('jobs.table.qualification')}</th>
            <th scope="col">{t('jobs.table.lastDate')}</th>
            <th scope="col">
              <span className="sr-only">{t('jobs.table.action')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const closingSoon = daysUntil(job.closingDate) <= 7;
            return (
              <tr key={job.id} className={cx(closingSoon ? 'bg-ember/10' : 'hover:bg-cream')}>
                <td className="whitespace-nowrap">{jobCode(job)}</td>
                <td>
                  <Link to={paths.job(job.id)} className="font-bold">
                    {job.title}
                  </Link>
                  {job.categoryName && <p className="text-xs">{job.categoryName}</p>}
                </td>
                <td className="whitespace-nowrap">{t('jobs.bps', { bps: job.bps })}</td>
                <td>
                  <span className="inline-block rounded-sm bg-surface px-2 py-0.5 text-heritage">
                    {job.departmentName}
                  </span>
                </td>
                <td>{job.location}</td>
                <td>{job.vacancies}</td>
                <td>{qualificationName(ref, job.requirements.minQualification)}</td>
                <td
                  className={cx(
                    'whitespace-nowrap',
                    closingSoon ? 'font-bold text-ember' : 'font-medium',
                  )}
                >
                  {formatDate(job.closingDate)}
                </td>
                <td>
                  <Button to={paths.job(job.id)} size="sm">
                    {t('jobs.table.apply')}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
