import { Button } from '../../../components/common/Button';
import { SelectField } from '../../../components/forms/SelectField';
import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';

const CATEGORIES = ['open_merit', 'provincial', 'women', 'minority', 'disability'];

/** Quota rows: a category and its seats. Seats must add up to the vacancies. */
export function QuotaFields({ quotas, vacancies, onChange, error }) {
  const options = CATEGORIES.map((value) => ({ value, label: t(`quota.${value}`) }));
  const update = (index, key, value) =>
    onChange(quotas.map((q, i) => (i === index ? { ...q, [key]: value } : q)));
  const unused = CATEGORIES.find((c) => !quotas.some((q) => q.category === c));

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-xl">{t('adminJobs.form.quotas')}</legend>
      <p className="text-sm">{t('adminJobs.form.quotasHint', { count: vacancies || 0 })}</p>
      {error && (
        <p className="font-medium text-ember" role="alert">
          {error}
        </p>
      )}
      {quotas.map((quota, index) => (
        <div key={index} className="grid items-end gap-3 sm:grid-cols-[1fr_10rem_auto]">
          <SelectField
            label={t('adminJobs.form.quotaCategory')}
            options={options}
            value={quota.category}
            onChange={(value) => update(index, 'category', value)}
          />
          <TextField
            label={t('adminJobs.form.quotaSeats')}
            type="number"
            min="1"
            value={quota.seats}
            onChange={(event) => update(index, 'seats', event.target.value)}
          />
          <Button
            variant="ghost"
            disabled={quotas.length === 1}
            onClick={() => onChange(quotas.filter((_, i) => i !== index))}
          >
            {t('adminJobs.form.removeQuota')}
          </Button>
        </div>
      ))}
      {unused && (
        <Button
          variant="secondary"
          onClick={() => onChange([...quotas, { category: unused, seats: '' }])}
        >
          {t('adminJobs.form.addQuota')}
        </Button>
      )}
    </fieldset>
  );
}
