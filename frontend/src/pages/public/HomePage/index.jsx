import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getJobStats, searchJobs } from '../../../api/jobs';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { JobsTable } from '../../../components/common/JobsTable';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { HowItWorks } from './HowItWorks';

const RECENT_COUNT = 5;

/** Landing page (Figma "Homepage", T-142). AppLayout adds the category/BPS cards and FAQ. */
export default function HomePage() {
  useDocumentTitle(null);
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [query, setQuery] = useState('');
  const stats = useAsync(getJobStats, []);
  const recent = useAsync(
    () => searchJobs({ sort: 'newest', page: 1, pageSize: RECENT_COUNT }),
    [],
  );

  // Header links such as /#faq scroll to their section.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  function search(event) {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `${paths.jobs}?q=${encodeURIComponent(q)}` : paths.jobs);
  }

  const figures = [
    { value: stats.data?.openJobs, label: t('hero.statJobs') },
    { value: stats.data?.vacancies, label: t('hero.statVacancies') },
    { value: stats.data?.departments, label: t('hero.statDepartments') },
  ];

  return (
    <>
      <section className="bg-cream">
        <div className="page grid items-center gap-8 py-10 md:grid-cols-[3fr_2fr] md:py-14">
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl leading-tight md:text-5xl">
              <span className="block text-ember">{t('hero.titleLine1')}</span>
              <span className="block text-heritage">{t('hero.titleLine2')}</span>
            </h1>
            <p className="max-w-xl text-lg">{t('hero.lead')}</p>
            <form
              role="search"
              onSubmit={search}
              className="flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="home-search" className="sr-only">
                {t('jobs.keywordLabel')}
              </label>
              <input
                id="home-search"
                type="search"
                className="min-h-12 min-w-0 flex-1 rounded-md border border-heritage bg-white px-4"
                placeholder={t('jobs.searchPlaceholder')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Button type="submit" size="lg">
                <Icon name="search" size={18} />
                {t('hero.explore')}
              </Button>
            </form>
          </div>

          <dl className="grid grid-cols-3 gap-3 rounded-lg bg-heritage p-5 text-white md:grid-cols-1 md:gap-5 md:p-8">
            {figures.map((figure) => (
              <div key={figure.label} className="flex flex-col-reverse">
                <dt className="text-sm text-cream md:text-base">{figure.label}</dt>
                <dd className="text-3xl leading-none font-bold text-gold md:text-5xl">
                  {figure.value ?? '–'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <HowItWorks />

      <section className="page flex flex-col gap-5 py-12" aria-labelledby="recent-heading">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 id="recent-heading" className="text-3xl">
            {t('home.recentTitle')}
          </h2>
          <p>{t('home.recentLead')}</p>
        </div>
        {recent.error && <ErrorState error={recent.error} onRetry={recent.reload} />}
        {!recent.error && !recent.data && <LoadingState label={t('jobs.loading')} />}
        {recent.data && <JobsTable jobs={recent.data.items} caption={t('home.recentTitle')} />}
        <Link to={paths.jobs} className="self-center font-bold">
          {t('home.showAll')} →
        </Link>
      </section>
    </>
  );
}
