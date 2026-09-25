import { Link } from 'react-router-dom';
import { getJobStats } from '../../api/jobs';
import { useAsync } from '../../hooks/useAsync';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';

// Trade icons from the design (24px stroke); other categories use a briefcase.
const CATEGORY_ICONS = {
  carpenter:
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  gateman:
    'M3 21h18M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4',
  pointsman:
    'M12 7.5v8m-4-6 4-2 4 2m-6 12 2-4 2 4M12 6.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z',
  welder: 'M13 10V3L4 14h7v7l9-11h-7z',
  fitter: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z',
  electrician: 'M6 7h12v13H6zM9 3v4m6-4v4m-6 7h6m-3-3v6',
  mason: 'M4 6h16M4 12h16M4 18h16M9 6v6m6 0v6M9 12v6',
  painter: 'M4 3h16v6H4zM8 9v3a2 2 0 0 0 2 2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2',
  driver:
    'M8 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM3 11l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5m-18 0h18v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4z',
};
const DEFAULT_ICON = 'M3 8h18v12H3zM8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M3 13h18';

function CountCard({ to, title, count, icon }) {
  return (
    <li>
      <Link
        to={to}
        className="group flex h-full flex-col justify-between gap-3 rounded-md border border-heritage bg-white p-5 text-black no-underline hover:bg-cream"
      >
        <span className="flex flex-col gap-2">
          {icon && (
            <svg
              className="size-7 text-heritage"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={icon} />
            </svg>
          )}
          <span className="text-base font-bold group-hover:text-ember">{title}</span>
        </span>
        <span className="text-sm">
          {t('home.jobsAvailable', { count })} <span aria-hidden="true">→</span>
        </span>
      </Link>
    </li>
  );
}

/** "Jobs By Category" and "Jobs By BPS" cards with live counts of open jobs (design: Malaika). */
export function JobsByCategoryAndBps() {
  const { data: stats } = useAsync(getJobStats, []);
  if (!stats) return null;

  const heading = (first, accent) => (
    <>
      {first} <span className="text-ember">{accent}</span>
    </>
  );

  return (
    <div id="categories" className="scroll-mt-4 border-t border-surface bg-surface py-12">
      <div className="page flex flex-col gap-14">
        {stats.byCategory.length > 0 && (
          <section aria-labelledby="jobs-by-category-heading">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="jobs-by-category-heading" className="text-2xl text-black md:text-3xl">
                  {heading(t('home.jobsBy'), t('home.category'))}
                </h2>
                <p className="mt-1.5">{t('home.byCategoryLead')}</p>
              </div>
              <Link to={paths.jobs} className="font-bold">
                {t('home.showAll')} →
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {stats.byCategory.map((category) => (
                <CountCard
                  key={category.code}
                  to={`${paths.jobs}?category=${category.code}`}
                  title={category.name}
                  count={category.count}
                  icon={CATEGORY_ICONS[category.code] ?? DEFAULT_ICON}
                />
              ))}
            </ul>
          </section>
        )}

        {stats.byBps.length > 0 && (
          <section aria-labelledby="jobs-by-bps-heading">
            <div className="mb-6">
              <h2 id="jobs-by-bps-heading" className="text-2xl text-black md:text-3xl">
                {heading(t('home.jobsBy'), t('home.bps'))}
              </h2>
              <p className="mt-1.5">{t('home.byBpsLead')}</p>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {stats.byBps.map((scale) => (
                <CountCard
                  key={scale.bps}
                  to={`${paths.jobs}?scale=${scale.bps}`}
                  title={t('home.bpsCard', { bps: scale.bps })}
                  count={scale.count}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
