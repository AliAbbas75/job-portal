import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createJob, getAdminJob, updateJob } from '../../../api/adminJobs';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { CheckboxField } from '../../../components/forms/CheckboxField';
import { SelectField } from '../../../components/forms/SelectField';
import { TextField } from '../../../components/forms/TextField';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { errorMessage } from '../../../utils/errorMessage';
import { emptyForm, errorsFromApi, formFromJob, payloadFromForm, validateForm } from './jobForm';
import { QuotaFields } from './QuotaFields';

const BPS_OPTIONS = Array.from({ length: 22 }, (_, i) => ({
  value: String(i + 1),
  label: `BPS-${i + 1}`,
}));

/** Create a job draft, or edit a draft/returned job (T-033). */
export default function JobFormPage() {
  const { jobId } = useParams();
  const editing = Boolean(jobId);
  useDocumentTitle(editing ? t('adminJobs.form.editTitle') : t('adminJobs.form.newTitle'));
  const existing = useAsync(() => (editing ? getAdminJob(jobId) : Promise.resolve(null)), [jobId]);
  const { data: ref } = useReferenceData();

  if (existing.error) {
    return (
      <div className="page">
        <ErrorState error={existing.error} onRetry={existing.reload} />
      </div>
    );
  }
  if (!ref || (editing && !existing.data)) return <LoadingState />;
  return <JobForm key={jobId ?? 'new'} job={existing.data} reference={ref} />;
}

function JobForm({ job, reference }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => (job ? formFromJob(job) : emptyForm()));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setText = (key) => (event) => set(key)(event.target.value);
  const toggle = (key, code) => (event) =>
    setForm((f) => ({
      ...f,
      [key]: event.target.checked ? [...f[key], code] : f[key].filter((c) => c !== code),
    }));

  const field = (key, props = {}) => ({
    value: form[key],
    onChange: setText(key),
    error: errors[key],
    ...props,
  });

  async function save(event) {
    event.preventDefault();
    const found = validateForm(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setFormError({ code: 'validation_error' });
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const payload = payloadFromForm(form);
      const saved = job ? await updateJob(job.id, payload) : await createJob(payload);
      navigate(paths.adminJob(saved.id));
    } catch (err) {
      setErrors(errorsFromApi(err.fields));
      setFormError(err);
      setBusy(false);
    }
  }

  const options = (list) => (list ?? []).map((item) => ({ value: item.code, label: item.name }));

  return (
    <form className="page space-y-8 py-8" onSubmit={save} noValidate>
      <div className="space-y-2">
        <h1 className="text-2xl">
          {job ? t('adminJobs.form.editTitle') : t('adminJobs.form.newTitle')}
        </h1>
        <p>{t('adminJobs.form.lead')}</p>
      </div>
      {formError && <Alert variant="error">{errorMessage(formError)}</Alert>}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-xl">{t('adminJobs.form.basics')}</legend>
        <TextField label={t('adminJobs.form.title')} required {...field('title')} />
        <SelectField
          label={t('adminJobs.form.department')}
          required
          options={options(reference.departments)}
          value={form.department}
          onChange={set('department')}
          error={errors.department}
        />
        <SelectField
          label={t('adminJobs.form.category')}
          required
          options={options(reference.jobCategories)}
          value={form.category}
          onChange={set('category')}
          error={errors.category}
        />
        <SelectField
          label={t('adminJobs.form.bps')}
          required
          options={BPS_OPTIONS}
          value={form.bps}
          onChange={set('bps')}
          error={errors.bps}
        />
        <TextField label={t('adminJobs.form.location')} required {...field('location')} />
        <SelectField
          label={t('adminJobs.form.employmentType')}
          required
          options={options(reference.employmentTypes)}
          value={form.employmentType}
          onChange={set('employmentType')}
        />
        <TextField
          label={t('adminJobs.form.vacancies')}
          type="number"
          min="1"
          required
          {...field('vacancies')}
        />
        <TextField label={t('adminJobs.form.requisitionRef')} {...field('requisitionRef')} />
        <div className="sm:col-span-2">
          <TextField
            label={t('adminJobs.form.summary')}
            hint={t('adminJobs.form.summaryHint')}
            maxLength={300}
            required
            {...field('summary')}
          />
        </div>
        <div className="sm:col-span-2">
          <TextField
            label={t('adminJobs.form.description')}
            multiline
            rows={6}
            required
            {...field('description')}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-xl">{t('adminJobs.form.dates')}</legend>
        <TextField
          label={t('adminJobs.form.openingDate')}
          type="date"
          required
          {...field('openingDate')}
        />
        <TextField
          label={t('adminJobs.form.closingDate')}
          type="date"
          required
          {...field('closingDate')}
        />
        <TextField
          label={t('adminJobs.form.ageCutoffDate')}
          hint={t('adminJobs.form.ageCutoffHint')}
          type="date"
          {...field('ageCutoffDate')}
        />
        <TextField label={t('adminJobs.form.fee')} type="number" min="0" {...field('fee')} />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-xl">{t('adminJobs.form.requirements')}</legend>
        <SelectField
          label={t('adminJobs.form.minQualification')}
          required
          options={options(reference.qualificationLevels)}
          value={form.minQualification}
          onChange={set('minQualification')}
          error={errors.minQualification}
        />
        <TextField
          label={t('adminJobs.form.minMarks')}
          type="number"
          min="0"
          max="100"
          {...field('minMarksPercent')}
        />
        <TextField
          label={t('adminJobs.form.experienceYears')}
          type="number"
          min="0"
          step="0.5"
          {...field('experienceYears')}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label={t('adminJobs.form.ageMin')}
            type="number"
            required
            {...field('ageMin')}
          />
          <TextField
            label={t('adminJobs.form.ageMax')}
            type="number"
            required
            {...field('ageMax')}
          />
        </div>
        <div className="space-y-2">
          <p className="font-medium">{t('adminJobs.form.domicile')}</p>
          <p className="text-sm">{t('adminJobs.form.domicileHint')}</p>
          {reference.provinces.map((province) => (
            <CheckboxField
              key={province.code}
              label={province.name}
              checked={form.domicileProvinces.includes(province.code)}
              onChange={toggle('domicileProvinces', province.code)}
            />
          ))}
        </div>
        <div className="space-y-2">
          <p className="font-medium">{t('adminJobs.form.documents')}</p>
          {reference.documentTypes.map((doc) => (
            <CheckboxField
              key={doc.code}
              label={doc.name}
              checked={form.documents.includes(doc.code)}
              onChange={toggle('documents', doc.code)}
            />
          ))}
        </div>
      </fieldset>

      <QuotaFields
        quotas={form.quotas}
        vacancies={form.vacancies}
        onChange={set('quotas')}
        error={errors.quotas}
      />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" loading={busy}>
          {t('adminJobs.form.save')}
        </Button>
        <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>
          {t('adminJobs.form.cancel')}
        </Button>
      </div>
    </form>
  );
}
