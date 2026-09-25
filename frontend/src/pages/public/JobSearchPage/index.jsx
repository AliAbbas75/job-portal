import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getJobStats, searchJobs } from '../../../api/jobs';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { JobsTable } from '../../../components/common/JobsTable';
import { EmptyState, ErrorState, LoadingState } from '../../../components/common/PageState';
import { Pagination } from '../../../components/common/Pagination';
import { SelectField } from '../../../components/forms/SelectField';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { FILTER_KEYS, PAGE_SIZES, toOptions } from './filters';

const SCALES = Array.from({ length: 22 }, (_, i) => ({
  value: String(i + 1),
  label: `BPS-${i + 1}`,
}));

/** Available Jobs (T-143): keyword search, filter row, table and numbered pages. */
export default function JobSearchPage() {
  useDocumentTitle(t('jobs.pageTitle'));
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: ref } = useReferenceData();
  const { data: stats } = useAsync(getJobStats, []);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? '']));
  const page = Number(searchParams.get('page')) || 1;
  const filterKey = searchParams.toString();
  const results = useAsync(() => searchJobs({ ...filters, page, pageSize }), [filterKey, pageSize]);

  const [draft, setDraft] = useState(filters.q);
  const [syncedQ, setSyncedQ] = useState(filters.q);
  if (syncedQ !== filters.q) {
    setSyncedQ(filters.q);
    setDraft(filters.q);
  }

  function update(next, nextPage = 1) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, ...next })) {
      if (value) params.set(key, value);
    }
    if (nextPage > 1) params.set('page', String(nextPage));
    setSearchParams(params, { replace: true });
  }

  const clearAll = () => update(Object.fromEntries(FILTER_KEYS.map((key) => [key, ''])));
  const hasFilters = FILTER_KEYS.some((key) => filters[key]);
  const set = (key) => (value) => update({ [key]: value });
  const data = results.data;

  return (
    <div className="page flex flex-col gap-6 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl">{t('jobs.availableTitle')}</h1>
        <p>{t('jobs.availableLead')}</p>
      </div>

      <div className="flex flex-col gap-4 rounded-md border border-heritage bg-white p-4 md:p-5">
        <form
          role="search"
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            update({ q: draft.trim() });
          }}
        >
          <div className="relative min-w-0 flex-1">
            <label htmlFor="job-keyword" className="sr-only">
              {t('jobs.keywordLabel')}
            </label>
            <Icon
              name="search"
              size={20}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-heritage"
            />
            <input
              id="job-keyword"
              type="search"
              className="min-h-12 w-full rounded-md border border-heritage bg-white pr-4 pl-12"
              placeholder={t('jobs.searchPlaceholder')}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="sm:w-52">
            {t('jobs.search')}
          </Button>
        </form>

        <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[auto_repeat(5,minmax(0,1fr))_auto]">
          <p className="font-bold lg:pb-3">{t('jobs.filters.by')}</p>
          <SelectField
            label={t('jobs.filters.scale')}
            placeholder={t('jobs.filters.scaleAll')}
            options={SCALES}
            value={filters.scale}
            onChange={set('scale')}
          />
          <SelectField
            label={t('jobs.filters.department')}
            placeholder={t('jobs.filters.departmentAll')}
            options={toOptions(ref?.departments)}
            value={filters.department}
            onChange={set('department')}
          />
          <SelectField
            label={t('jobs.filters.category')}
            placeholder={t('jobs.filters.categoryAll')}
            options={toOptions(ref?.jobCategories)}
            value={filters.category}
            onChange={set('category')}
          />
          <SelectField
            label={t('jobs.filters.location')}
            placeholder={t('jobs.filters.locationAll')}
            options={(stats?.locations ?? []).map((city) => ({ value: city, label: city }))}
            value={filters.location}
            onChange={set('location')}
          />
          <SelectField
            label={t('jobs.filters.qualification')}
            placeholder={t('jobs.filters.qualificationAll')}
            options={toOptions(ref?.qualificationLevels)}
            value={filters.qualification}
            onChange={set('qualification')}
          />
          <Button variant="ghost" disabled={!hasFilters} onClick={clearAll} className="lg:mb-1">
            {t('jobs.clearAll')}
          </Button>
        </div>
      </div>

      <p className="font-bold" aria-live="polite">
        {data ? t('jobs.resultCount', { count: data.total }) : ' '}
      </p>

      {results.error && <ErrorState error={results.error} onRetry={results.reload} />}
      {!results.error && !data && <LoadingState label={t('jobs.loading')} />}
      {data && data.total === 0 && (
        <EmptyState
          title={t('jobs.emptyTitle')}
          description={t('jobs.emptyDescription')}
          action={
            hasFilters && (
              <Button variant="secondary" onClick={clearAll}>
                {t('jobs.clearAll')}
              </Button>
            )
          }
        />
      )}
      {data && data.total > 0 && (
        <>
          <div aria-busy={results.loading}>
            <JobsTable jobs={data.items} caption={t('jobs.availableTitle')} />
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={data.total}
            sizes={PAGE_SIZES}
            onPage={(next) => update({}, next)}
            onPageSize={(size) => {
              setPageSize(size);
              update({});
            }}
          />
        </>
      )}
    </div>
  );
}
