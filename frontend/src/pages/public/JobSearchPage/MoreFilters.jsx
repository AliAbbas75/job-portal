import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/forms/Select';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { toOptions } from './filters';

function FilterSelect({ label, value, onChange, allLabel, options }) {
  return (
    <Select
      size="sm"
      ariaLabel={label}
      value={value}
      onChange={onChange}
      placeholder={allLabel}
      options={options}
      className="min-w-0 md:w-44"
    />
  );
}

/** Secondary filters shown beside the result count: sort, type, qualification, deadline. */
export function MoreFilters({ filters, onChange, onClear, hasFilters }) {
  const { data: ref } = useReferenceData();
  const set = (key) => (value) => onChange({ [key]: value });

  return (
    <div
      className="grid w-full grid-cols-2 items-center gap-2 md:flex md:w-auto md:flex-wrap"
      role="group"
      aria-label={t('jobs.filters.refine')}
    >
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
