import { useId, useRef, useState } from 'react';
import { ALLOWED_FILE_TYPES, MAX_FILE_BYTES } from '../../api/documents';
import { t } from '../../i18n';
import { compressImage } from '../../utils/compressImage';
import { errorMessage } from '../../utils/errorMessage';
import { formatDate, formatFileSize } from '../../utils/format';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import styles from './DocumentUpload.module.css';

/**
 * One document slot in the vault. `onUpload(file)` and `onDelete()` return promises.
 * Checks type/size in the browser and compresses large images before upload.
 */
export function DocumentUpload({ label, document, onUpload, onDelete, required = false }) {
  const inputRef = useRef(null);
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(event) {
    const picked = event.target.files?.[0];
    event.target.value = '';
    if (!picked) return;
    setError(null);
    if (!ALLOWED_FILE_TYPES.includes(picked.type)) {
      setError(t('errors.file_type_not_allowed'));
      return;
    }
    setBusy(true);
    try {
      const file = await compressImage(picked);
      if (file.size > MAX_FILE_BYTES) {
        setError(t('errors.file_too_large'));
        return;
      }
      await onUpload(file);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await onDelete();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.slot}>
      <span className={`${styles.icon} ${document ? styles.done : ''}`}>
        <Icon name={document ? 'check' : 'file'} size={20} />
      </span>
      <div className={styles.info}>
        <p className={styles.label}>
          {label}
          {required && <span className={styles.required}> {t('documents.requiredTag')}</span>}
        </p>
        <p className={styles.meta}>
          {document
            ? t('documents.uploadedMeta', {
                name: document.fileName,
                size: formatFileSize(document.size),
                date: formatDate(document.uploadedAt),
              })
            : t('documents.notUploaded')}
        </p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
      <div className={styles.actions}>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ALLOWED_FILE_TYPES.join(',')}
          className="visually-hidden"
          onChange={handleFile}
          aria-label={t('documents.chooseFileFor', { name: label })}
        />
        <Button
          variant={document ? 'secondary' : 'primary'}
          size="sm"
          loading={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Icon name="upload" size={16} />
          {document ? t('documents.replace') : t('documents.upload')}
        </Button>
        {document && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={busy}
            aria-label={t('documents.removeNamed', { name: label })}
          >
            <Icon name="trash" size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
