import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getJobStats, searchJobs } from '../../../api/jobs';
import { Icon } from '../../../components/common/Icon';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { HowItWorks } from './HowItWorks';
import { RecentJobsList } from './RecentJobsList';

const RECENT_COUNT = 5;

/** Landing page (Figma "Homepage", T-142). AppLayout adds the category/BPS cards and FAQ. */
export default function HomePage() {
  useDocumentTitle(null);
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
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
    const loc = location.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (loc) params.set('location', loc);
    const queryString = params.toString();
    navigate(queryString ? `${paths.jobs}?${queryString}` : paths.jobs);
  }

  return (
    <>
      {/* Hero section with full-height train image contained within page width */}
      <section className="relative overflow-hidden bg-white">
        <div className="page relative flex min-h-[460px] items-center py-12 sm:py-16 lg:min-h-[520px] lg:py-20">
          {/* Full-height train image on the right, strictly bounded by the page container width */}
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[54%] items-center justify-end overflow-hidden lg:flex xl:w-[58%]">
            <div className="relative h-full w-full">
              <img
                src="/login-train-bg.jpg"
                alt="Pakistan Railways locomotive on scenic tracks"
                className="h-full w-full object-cover object-[24%_center] lg:object-[20%_center]"
              />
              {/* Smooth white haze gradient fading the left edge into the solid white background */}
              <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-white via-white/85 to-transparent lg:w-48" />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/30 to-transparent" />
            </div>
          </div>

          {/* Content container */}
          <div className="relative z-10 max-w-xl lg:max-w-lg xl:max-w-xl">
            {/* Eyebrow */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-[0.2em] text-heritage uppercase">
              <span>Pakistan Railways</span>
              <span className="text-black/25" aria-hidden="true">
                |
              </span>
              <span>Serving The Nation</span>
              <span className="text-black/25" aria-hidden="true">
                |
              </span>
              <span>Building Futures</span>
            </div>

            <h1 className="font-serif mt-4 text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl lg:text-5xl">
              <span className="block text-heritage">Your Next Career</span>
              <span className="mt-1 block text-ember">Runs on Railways</span>
            </h1>

            <p className="mt-3.5 max-w-lg text-sm leading-relaxed text-black/75 sm:text-base">
              Explore a wide range of job opportunities in Pakistan Railways and be a part of a
              legacy that connects the nation.
            </p>

            {/* Reduced size filter */}
            <form
              role="search"
              onSubmit={search}
              className="border-stone-200 shadow-sm mt-6 flex max-w-md flex-col items-stretch gap-1.5 rounded-xl border bg-white p-1.5 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1">
                <Icon name="search" size={17} className="flex-none text-black/40" />
                <label htmlFor="home-search" className="sr-only">
                  {t('jobs.keywordLabel')}
                </label>
                <input
                  id="home-search"
                  role="searchbox"
                  type="search"
                  className="w-full border-none bg-transparent py-1 text-xs text-black placeholder:text-black/40 focus:outline-none sm:text-sm"
                  placeholder="Job title, skills or keyword"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <div className="bg-stone-200 hidden h-5 w-px sm:block" aria-hidden="true" />

              <div className="flex w-full items-center gap-1.5 border-t border-stone-200 px-2.5 py-1.5 sm:w-auto sm:border-t-0 sm:py-1">
                <Icon name="mapPin" size={16} className="flex-none text-black/40" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full cursor-pointer border-none bg-transparent pr-3 text-xs font-medium text-black/80 focus:outline-none sm:w-auto"
                  aria-label="Select location"
                >
                  <option value="">Select location</option>
                  {(stats.data?.locations ?? []).map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-ember px-5 py-2.5 text-xs font-semibold whitespace-nowrap text-white transition-opacity hover:opacity-90 sm:w-auto sm:py-2 sm:text-sm"
              >
                <span>Find Jobs</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* Recent jobs - GitHub row design from last week */}
      <section className="page flex flex-col gap-5 py-12" aria-labelledby="recent-heading">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 id="recent-heading" className="text-3xl font-bold">
            {t('home.recentTitle')}
          </h2>
          <p>{t('home.recentLead')}</p>
        </div>
        {recent.error && <ErrorState error={recent.error} onRetry={recent.reload} />}
        {!recent.error && !recent.data && <LoadingState label={t('jobs.loading')} />}
        {recent.data && <RecentJobsList jobs={recent.data.items} />}
        <Link to={paths.jobs} className="self-center font-bold">
          {t('home.showAll')} →
        </Link>
      </section>
    </>
  );
}
