import { Link } from 'react-router-dom';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { daysUntil } from '../../../utils/format';

/**
 * Recent jobs list - GitHub row layout from previous milestone.
 * Highlights rows closing within 7 days with red left accent and soft tint.
 */
export function RecentJobsList({ jobs }) {
  return (
    <ul className="list-none divide-y-0 p-0" aria-label={t('home.recentTitle')}>
      {jobs.map((job) => {
        const daysLeft = daysUntil(job.closingDate);
        const closingSoon = daysLeft <= 7;

        return (
          <li
            key={job.id}
            className={`group relative grid grid-cols-1 items-center gap-x-6 gap-y-4 border-b border-l-4 [border-bottom-style:dashed] border-b-heritage/30 py-5 pr-2 pl-4 transition-colors md:grid-cols-[1fr_auto] md:pr-4 md:pl-5 ${
              closingSoon
                ? 'border-l-ember bg-[#fdf2f1] hover:bg-[#fae2e0]'
                : 'border-l-transparent hover:bg-surface'
            }`}
          >
            {/* Left side: Location/Type details on top, Title, Department summary, Status badge */}
            <div className="min-w-0">
              <div
                className={`flex flex-wrap items-center gap-2 text-xs font-semibold ${
                  closingSoon ? 'text-ember' : 'text-heritage'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Icon name="mapPin" size={13} />
                  <span>{job.location}</span>
                </span>
                <span className="text-black/30" aria-hidden="true">
                  ·
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="briefcase" size={13} />
                  <span>{t(`employmentType.${job.employmentType}`)}</span>
                </span>
                <span className="text-black/30" aria-hidden="true">
                  ·
                </span>
                <span>{t('job.vacancies', { count: job.vacancies })}</span>
              </div>

              <h3 className="my-1.5 text-lg font-bold text-black sm:text-xl">
                <Link
                  to={paths.job(job.id)}
                  className={`no-underline transition-colors ${
                    closingSoon ? 'text-black hover:text-ember' : 'text-black hover:text-heritage'
                  }`}
                >
                  {job.title}
                </Link>
              </h3>

              <p className="text-sm text-black/70">
                <strong className={`font-semibold ${closingSoon ? 'text-ember' : 'text-heritage'}`}>
                  {job.departmentName}
                </strong>{' '}
                · {job.summary}
              </p>

              {/* Status on left side (Closed, Open, Closing soon) */}
              <div className="mt-2.5 flex items-center gap-2">
                {daysLeft < 0 ? (
                  <span className="inline-flex items-center rounded-sm bg-black/10 px-2.5 py-0.5 text-xs font-semibold text-black/70">
                    Closed
                  </span>
                ) : closingSoon ? (
                  <span className="inline-flex items-center rounded-sm bg-ember/15 px-2.5 py-0.5 text-xs font-bold text-ember">
                    Closing soon · {t('jobs.closesIn', { count: daysLeft })}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-sm bg-heritage/10 px-2.5 py-0.5 text-xs font-semibold text-heritage">
                    Open · {t('jobs.closesIn', { count: daysLeft })}
                  </span>
                )}
              </div>
            </div>

            {/* Right side: No label BPS | Apply now rectangle button */}
            <div className="flex items-center gap-3 sm:gap-4 md:self-center">
              <span className="text-sm font-bold whitespace-nowrap text-heritage sm:text-base">
                {t('jobs.bps', { bps: job.bps })}
              </span>
              <span className="text-black/25" aria-hidden="true">
                |
              </span>
              <Button to={paths.job(job.id)} size="sm" className="rounded-md">
                {t('jobs.table.apply')}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
