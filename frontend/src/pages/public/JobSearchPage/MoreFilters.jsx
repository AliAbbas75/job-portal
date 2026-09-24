import { Button } from '../../../components/common/Button';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { toOptions } from './filters';
import styles from './JobSearchPage.module.css';

function FilterSelect({ label, value, onChange, allLabel, options }) {
  return (
    <select
      className={styles.filter}
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {allLabel && <option value="">{allLabel}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Secondary filters shown beside the result count: sort, type, qualification, deadline. */
export function MoreFilters({ filters, onChange, onClear, hasFilters }) {
  const { data: ref } = useReferenceData();
  const set = (key) => (value) => onChange({ [key]: value });

  return (
    <div className={styles.moreFilters} role="group" aria-label={t('jobs.filters.refine')}>
      <FilterSelect
        label={t('jobs.filters.sort')}
        value={filters.sort}
        onChange={set('sort')}
        options={[
          { value: '', label: t('jobs.filters.sortNewest') },
          { value: 'closing', label: t('jobs.filters.sortClosing') },
        ]}
      />
      <FilterSelect
        label={t('jobs.filters.employmentType')}
        value={filters.employmentType}
        onChange={set('employmentType')}
        allLabel={t('jobs.filters.employmentTypeAll')}
        options={toOptions(ref?.employmentTypes)}
      />
      <FilterSelect
        label={t('jobs.filters.qualification')}
        value={filters.qualification}
        onChange={set('qualification')}
        allLabel={t('jobs.filters.qualificationAll')}
        options={toOptions(ref?.qualificationLevels)}
      />
      <FilterSelect
        label={t('jobs.filters.closing')}
        value={filters.closing}
        onChange={set('closing')}
        allLabel={t('jobs.filters.closingAll')}
        options={[
          { value: 'week', label: t('jobs.filters.closingWeek') },
          { value: 'month', label: t('jobs.filters.closingMonth') },
        ]}
      />
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          {t('jobs.clearFilters')}
        </Button>
      )}
    </div>
  );
}
