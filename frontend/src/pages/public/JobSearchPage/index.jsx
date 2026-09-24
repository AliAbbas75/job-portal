import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getJobStats, searchJobs } from '../../../api/jobs';
import { Button } from '../../../components/common/Button';
import { EmptyState, ErrorState, LoadingState } from '../../../components/common/PageState';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { t } from '../../../i18n';
import { FILTER_KEYS } from './filters';
import { HomeHero } from './HomeHero';
import { JobListItem } from './JobListItem';
import { MoreFilters } from './MoreFilters';
import { SearchCard } from './SearchCard';

const PAGE_SIZE = 10;

export default function JobSearchPage() {
  useDocumentTitle(t('jobs.pageTitle'));
  const [searchParams, setSearchParams] = useSearchParams();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const resultsRef = useRef(null);

  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? '']));
  const filterKey = searchParams.toString();

  const stats = useAsync(getJobStats, []);
  const results = useAsync(
    () => searchJobs({ ...filters, page: 1, pageSize: limit }),
    [filterKey, limit],
  );

  function updateFilters(next) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, ...next })) {
      if (value) params.set(key, value);
    }
    setLimit(PAGE_SIZE);
    setSearchParams(params, { replace: true });
  }

  const clearFilters = () => updateFilters(Object.fromEntries(FILTER_KEYS.map((key) => [key, ''])));
  const showResults = () => resultsRef.current?.scrollIntoView({ behavior: 'smooth' });

  const data = results.data;
  const hasFilters = FILTER_KEYS.some((key) => key !== 'sort' && filters[key]);

  return (
    <>
      <HomeHero stats={stats.data}>
        <SearchCard
          filters={filters}
          locations={stats.data?.locations ?? []}
          onChange={updateFilters}
          onSearch={showResults}
        />
      </HomeHero>

      <section ref={resultsRef} className="page pt-8" aria-labelledby="job-results-heading">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-heritage pb-3">
          <h2 id="job-results-heading" className="text-lg text-black" aria-live="polite">
            {data ? t('jobs.resultCount', { count: data.total }) : ' '}
          </h2>
          <MoreFilters
            filters={filters}
            onChange={updateFilters}
            onClear={clearFilters}
            hasFilters={hasFilters}
          />
        </div>

        {results.error && <ErrorState error={results.error} onRetry={results.reload} />}
        {!results.error && !data && <LoadingState label={t('jobs.loading')} />}
        {data && data.total === 0 && (
          <EmptyState
            title={t('jobs.emptyTitle')}
            description={t('jobs.emptyDescription')}
            action={
              hasFilters && (
                <Button variant="secondary" onClick={clearFilters}>
                  {t('jobs.clearFilters')}
                </Button>
              )
            }
          />
        )}
        {data && data.total > 0 && (
          <>
            <ul aria-busy={results.loading}>
              {data.items.map((job) => (
                <JobListItem key={job.id} job={job} />
              ))}
            </ul>
            {data.items.length < data.total && (
              <div className="flex justify-center pt-8">
                <Button
                  variant="secondary"
                  loading={results.loading}
                  onClick={() => setLimit((n) => n + PAGE_SIZE)}
                >
                  {t('jobs.showMore')}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
