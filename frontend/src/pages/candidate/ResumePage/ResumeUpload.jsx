import { useId, useState } from 'react';
import { uploadResume } from '../../../api/resume';
import { Alert } from '../../../components/common/Alert';
import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';
import { cx } from '../../../utils/cx';
import { errorMessage } from '../../../utils/errorMessage';

const ACCEPT =
  'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** T-054: pick a PDF or Word resume and read it. onParsed(result) gets the suggestions. */
export function ResumeUpload({ result, onParsed }) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onParsed(await uploadResume(file));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p>{t('resume.upload.lead')}</p>
      {error && <Alert variant="error">{error}</Alert>}
      {result &&
        (result.parsed ? (
          <Alert variant="success" title={t('resume.upload.parsedTitle')}>
            {t('resume.upload.parsed')}
          </Alert>
        ) : (
          <Alert variant="warning" title={t('resume.upload.unreadableTitle')}>
            {t('resume.upload.unreadable')}
          </Alert>
        ))}
      <div>
        <label
          htmlFor={inputId}
          aria-disabled={busy}
          className={cx(
            'inline-flex items-center gap-2 rounded-sm border border-heritage px-4 py-2 font-bold text-heritage',
            busy ? 'cursor-wait opacity-60' : 'cursor-pointer hover:bg-surface',
          )}
        >
          <Icon name="upload" size={16} />
          {busy ? t('resume.upload.reading') : t('resume.upload.button')}
        </label>
        <input
          id={inputId}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          disabled={busy}
          onChange={upload}
        />
      </div>
      <p className="text-sm">{t('resume.upload.hint')}</p>
    </div>
  );
}
