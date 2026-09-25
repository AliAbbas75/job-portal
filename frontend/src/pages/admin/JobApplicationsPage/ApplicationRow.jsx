import { useState } from 'react';
import { changeApplicationStatus, confirmFee } from '../../../api/adminApplications';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { FeeBadge } from '../../../components/common/FeeBadge';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { SelectField } from '../../../components/forms/SelectField';
import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { errorMessage } from '../../../utils/errorMessage';
import { formatDate } from '../../../utils/format';

/** One applicant, with a status-change form for admins. onChanged(updatedApplication). */
export function ApplicationRow({ application, canChange, onChanged }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [feeOpen, setFeeOpen] = useState(false);
  const [reference, setReference] = useState('');
  const { candidate } = application;
  const next = application.nextStatuses ?? [];

  async function save(event) {
    event.preventDefault();
    if (!status) {
      setError(t('adminApplications.chooseStatus'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onChanged(await changeApplicationStatus(application.id, { status, note }));
      setOpen(false);
      setStatus('');
      setNote('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function saveFee(event) {
    event.preventDefault();
    if (!reference.trim()) {
      setError(t('fee.referenceRequired'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onChanged(await confirmFee(application.id, { reference }));
      setFeeOpen(false);
      setReference('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-md border border-heritage bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold">{candidate.name}</p>
          <p className="text-sm">
            {t('adminApplications.meta', {
              id: application.id,
              cnic: candidate.cnic,
              age: candidate.age ?? '-',
              domicile: candidate.domicile || '-',
              date: formatDate(application.submittedAt),
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={application.status} />
          <FeeBadge fee={application.fee} />
          {canChange && application.fee?.status === 'unpaid' && !feeOpen && (
            <Button variant="secondary" size="sm" onClick={() => setFeeOpen(true)}>
              {t('fee.confirm')}
            </Button>
          )}
          {canChange && next.length > 0 && !open && (
            <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
              {t('adminApplications.change')}
            </Button>
          )}
        </div>
      </div>

      {feeOpen && (
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={saveFee}>
          <TextField
            label={t('fee.reference')}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" loading={busy}>
              {t('fee.confirmSave')}
            </Button>
            <Button variant="ghost" onClick={() => setFeeOpen(false)}>
              {t('adminJobs.form.cancel')}
            </Button>
          </div>
          {error && (
            <div className="sm:col-span-2">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
        </form>
      )}

      {open && (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[16rem_1fr_auto] sm:items-end"
          onSubmit={save}
        >
          <SelectField
            label={t('adminApplications.newStatus')}
            options={next.map((value) => ({ value, label: t(`status.${value}`) }))}
            value={status}
            onChange={setStatus}
          />
          <TextField
            label={t('adminApplications.note')}
            hint={t('adminApplications.noteHint')}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" loading={busy}>
              {t('adminApplications.save')}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('adminJobs.form.cancel')}
            </Button>
          </div>
          {error && (
            <div className="sm:col-span-3">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
        </form>
      )}
    </li>
  );
}
