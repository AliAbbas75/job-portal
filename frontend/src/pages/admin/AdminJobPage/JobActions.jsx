import { useState } from 'react';
import { decideJob, publishJob, submitJob } from '../../../api/adminJobs';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { TextField } from '../../../components/forms/TextField';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { errorMessage } from '../../../utils/errorMessage';
import { APPROVER_ROLES, CREATOR_ROLES, PUBLISHER_ROLES } from '../../../utils/staffRoles';

const EDITABLE = ['draft', 'returned'];

/** The next step for this job, if the user's role allows one. onChange(updatedJob). */
export function JobActions({ job, staff, onChange }) {
  const [comments, setComments] = useState('');
  const [advertisementNo, setAdvertisementNo] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  async function run(name, action) {
    setBusy(name);
    setError(null);
    try {
      onChange(await action());
      setComments('');
    } catch (err) {
      // A draft requisition that isn't complete yet: name what's missing.
      const missing = err.fields?.incomplete;
      setError(
        missing
          ? t('adminJobs.detail.incomplete', {
              fields: missing.map((f) => t(`adminJobs.detail.fields.${f}`)).join(', '),
            })
          : errorMessage(err),
      );
    } finally {
      setBusy(null);
    }
  }

  function decide(action) {
    if (action !== 'approved' && !comments.trim()) {
      setError(t('adminJobs.detail.commentsRequired'));
      return;
    }
    run(action, () => decideJob(job.id, { action, comments }));
  }

  const can = (roles) => roles.includes(staff.role);
  const panel = 'flex flex-col gap-4 rounded-md border-2 border-heritage bg-white p-5';
  const errorAlert = error && <Alert variant="error">{error}</Alert>;

  if (EDITABLE.includes(job.status) && can(CREATOR_ROLES)) {
    return (
      <div className={panel}>
        {errorAlert}
        <Button to={paths.adminEditJob(job.id)} variant="secondary" fullWidth>
          {t('adminJobs.detail.edit')}
        </Button>
        <Button
          fullWidth
          loading={busy === 'submit'}
          onClick={() => run('submit', () => submitJob(job.id))}
        >
          {t('adminJobs.detail.submit')}
        </Button>
      </div>
    );
  }

  if (job.status === 'pending_approval' && can(APPROVER_ROLES)) {
    if (job.createdBy === staff.id) {
      return <Alert variant="info">{t('adminJobs.detail.ownJob')}</Alert>;
    }
    return (
      <div className={panel}>
        <h2 className="text-xl">{t('adminJobs.detail.decideTitle')}</h2>
        {errorAlert}
        <TextField
          label={t('adminJobs.detail.comments')}
          hint={t('adminJobs.detail.commentsHint')}
          multiline
          value={comments}
          onChange={(event) => setComments(event.target.value)}
        />
        <Button fullWidth loading={busy === 'approved'} onClick={() => decide('approved')}>
          {t('adminJobs.detail.approve')}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          loading={busy === 'returned'}
          onClick={() => decide('returned')}
        >
          {t('adminJobs.detail.return')}
        </Button>
        <Button
          variant="danger"
          fullWidth
          loading={busy === 'rejected'}
          onClick={() => decide('rejected')}
        >
          {t('adminJobs.detail.reject')}
        </Button>
      </div>
    );
  }

  if (job.status === 'approved' && can(PUBLISHER_ROLES)) {
    return (
      <div className={panel}>
        <h2 className="text-xl">{t('adminJobs.detail.publishTitle')}</h2>
        <p>{t('adminJobs.detail.publishLead')}</p>
        {errorAlert}
        <TextField
          label={t('adminJobs.detail.advertisementNo')}
          hint={t('adminJobs.detail.advertisementHint')}
          value={advertisementNo}
          onChange={(event) => setAdvertisementNo(event.target.value)}
        />
        <Button
          variant="accent"
          fullWidth
          loading={busy === 'publish'}
          onClick={() => run('publish', () => publishJob(job.id, { advertisementNo }))}
        >
          {t('adminJobs.detail.publish')}
        </Button>
      </div>
    );
  }

  return null;
}
