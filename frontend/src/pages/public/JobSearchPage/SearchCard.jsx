import { useState } from 'react';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { SelectField } from '../../../components/forms/SelectField';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { toOptions } from './filters';
import styles from './JobSearchPage.module.css';

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

  const set = (key) => (event) => onChange({ [key]: event.target.value });

  return (
    <form role="search" className={styles.searchCard} onSubmit={submit}>
      <div className={styles.searchRow}>
        <div className={styles.searchField}>
          <label htmlFor="job-keyword" className="visually-hidden">
            {t('jobs.keywordLabel')}
          </label>
          <Icon name="search" size={20} className={styles.searchIcon} />
          <input
            id="job-keyword"
            type="search"
            className={styles.searchInput}
            placeholder={t('jobs.searchPlaceholder')}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>
        <Button type="submit" size="lg" className={styles.findButton}>
          <Icon name="search" size={18} className={styles.findIcon} />
          {t('jobs.findJobs')}
        </Button>
      </div>

      <div className={styles.cardFilters}>
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
