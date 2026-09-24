import { useId, useRef, useState } from 'react';
import { ALLOWED_FILE_TYPES, MAX_FILE_BYTES } from '../../api/documents';
import { t } from '../../i18n';
import { compressImage } from '../../utils/compressImage';
import { errorMessage } from '../../utils/errorMessage';
import { cx } from '../../utils/cx';
import { formatDate, formatFileSize } from '../../utils/format';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

/**
 * One document slot in the vault. `onUpload(file)` and `onDelete()` return promises.
 * Checks type/size in the browser and compresses large images before upload.
 * `divider={false}` drops the bottom border (e.g. inside an already-divided list).
 */
export function DocumentUpload({
  label,
  document,
  onUpload,
  onDelete,
  required = false,
  divider = true,
}) {
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
    <div
      className={cx(
        'flex flex-wrap items-center gap-x-4 gap-y-3',
        divider && 'border-b border-dashed border-heritage py-4',
      )}
    >
      <span
        className={cx(
          'grid size-10 flex-none place-items-center rounded-sm border border-heritage',
          document ? 'bg-heritage text-white' : 'text-heritage',
        )}
      >
        <Icon name={document ? 'check' : 'file'} size={20} />
      </span>
      <div className="min-w-0 flex-[1_1_220px]">
        <p className="font-medium">
          {label}
          {required && <span className="text-sm text-ember"> {t('documents.requiredTag')}</span>}
        </p>
        <p className="text-sm wrap-anywhere">
          {document
            ? t('documents.uploadedMeta', {
                name: document.fileName,
                size: formatFileSize(document.size),
                date: formatDate(document.uploadedAt),
              })
            : t('documents.notUploaded')}
        </p>
        {error && (
          <p className="mt-1 text-sm font-medium text-ember" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ALLOWED_FILE_TYPES.join(',')}
          className="sr-only"
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
