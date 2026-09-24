import { useState } from 'react';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { SelectField } from '../../../components/forms/SelectField';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { toOptions } from './filters';

/** Hero search: keyword plus the three most-used filters (BPS, department, location). */
export function SearchCard({ filters, locations, onChange, onSearch }) {
  const { data: ref } = useReferenceData();
  const [draft, setDraft] = useState(filters.q);
  const [syncedQ, setSyncedQ] = useState(filters.q);

  // Keep the box in sync when the URL changes (e.g. "Clear filters" or back button).
  if (syncedQ !== filters.q) {
    setSyncedQ(filters.q);
    setDraft(filters.q);
  }

  function submit(event) {
    event.preventDefault();
    onChange({ q: draft.trim() });
    onSearch();
  }

  const set = (key) => (value) => onChange({ [key]: value });

  return (
    <form
      role="search"
      className="flex flex-col gap-4 rounded-lg bg-white p-4 text-black md:gap-5 md:p-6"
      onSubmit={submit}
    >
      <div className="flex flex-col gap-3 md:flex-row">
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
            className="min-h-14 w-full rounded-md border border-heritage bg-white pr-4 pl-12 text-lg focus-visible:outline-offset-0"
            placeholder={t('jobs.searchPlaceholder')}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>
        <Button type="submit" size="lg" className="flex-none">
          <Icon name="search" size={18} className="text-gold" />
          {t('jobs.findJobs')}
        </Button>
      </div>

      <div className="grid gap-3 border-t border-surface pt-4 md:grid-cols-3 md:gap-4 md:pt-5">
        <SelectField
          label={t('jobs.filters.bps')}
          placeholder={t('jobs.filters.bpsAll')}
          options={toOptions(ref?.bpsRanges)}
          value={filters.bps}
          onChange={set('bps')}
        />
        <SelectField
          label={t('jobs.filters.department')}
          placeholder={t('jobs.filters.departmentAll')}
          options={toOptions(ref?.departments)}
          value={filters.department}
          onChange={set('department')}
        />
        <SelectField
          label={t('jobs.filters.location')}
          placeholder={t('jobs.filters.locationAll')}
          options={locations.map((city) => ({ value: city, label: city }))}
          value={filters.location}
          onChange={set('location')}
        />
      </div>
    </form>
  );
}
