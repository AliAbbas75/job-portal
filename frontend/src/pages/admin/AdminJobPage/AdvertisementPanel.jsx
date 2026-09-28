import { useId, useState } from 'react';
import { attachAdvertisement } from '../../../api/adminJobs';
import { Alert } from '../../../components/common/Alert';
import { t } from '../../../i18n';
import { errorMessage } from '../../../utils/errorMessage';
import { CREATOR_ROLES } from '../../../utils/staffRoles';

const OPEN = ['draft', 'returned', 'pending_approval', 'approved'];

/** Attach or replace the newspaper advertisement until the job is published. onChange(job). */
export function AdvertisementPanel({ job, staff, onChange }) {
  const inputId = useId();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const canUpload = OPEN.includes(job.status) && CREATOR_ROLES.includes(staff.role);
  if (!canUpload && !job.hasAdvertisement) return null;

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await attachAdvertisement(job.id, file));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-heritage bg-white p-4">
      <h2 className="text-lg">{t('adminJobs.detail.advertisementTitle')}</h2>
      <p className="text-sm">
        {job.hasAdvertisement
          ? t('adminJobs.detail.advertisementAttached')
          : t('adminJobs.detail.advertisementNone')}
      </p>
      {error && <Alert variant="error">{error}</Alert>}
      {canUpload && (
        <>
          <label
            htmlFor={inputId}
            className="cursor-pointer rounded-sm border border-heritage px-4 py-2 text-center font-bold text-heritage hover:bg-surface"
            aria-disabled={busy}
          >
            {t('adminJobs.detail.advertisementUpload')}
          </label>
          <input
            id={inputId}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="sr-only"
            disabled={busy}
            onChange={upload}
          />
        </>
      )}
    </div>
  );
}
