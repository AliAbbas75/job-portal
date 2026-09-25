import { useEffect, useId, useState } from 'react';
import { getDocumentFile, uploadDocument } from '../../../api/documents';
import { Alert } from '../../../components/common/Alert';
import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';
import { compressImage } from '../../../utils/compressImage';
import { errorMessage } from '../../../utils/errorMessage';

/**
 * Profile picture = the candidate's "photo" document (the passport photo jobs ask for).
 * onChange(documents) after an upload.
 */
export function ProfilePicture({ name, documents, onChange }) {
  const inputId = useId();
  const photo = documents.find((d) => d.type === 'photo');
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!photo) return undefined;
    let objectUrl = null;
    let cancelled = false;
    getDocumentFile(photo.id)
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photo]);

  async function choose(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadDocument('photo', await compressImage(file));
      setUrl(URL.createObjectURL(file));
      onChange([...documents.filter((d) => d.type !== 'photo'), uploaded]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-6 border-b border-surface pb-6">
      <div className="relative">
        {url ? (
          <img
            src={url}
            alt={t('profileForm.pictureAlt')}
            className="size-20 rounded-full border-3 border-heritage object-cover"
          />
        ) : (
          <span className="flex size-20 items-center justify-center rounded-full border-3 border-heritage bg-heritage text-2xl font-bold text-white">
            {(name || '?').charAt(0).toUpperCase()}
          </span>
        )}
        <label
          htmlFor={inputId}
          className="absolute right-0 bottom-0 flex size-7 cursor-pointer items-center justify-center rounded-full bg-heritage text-white"
        >
          <Icon name="camera" size={14} />
          <span className="sr-only">{t('profileForm.pictureUpload')}</span>
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          disabled={busy}
          onChange={choose}
        />
      </div>
      <div>
        <h2 className="text-base text-black">{t('profileForm.pictureTitle')}</h2>
        <p className="mt-0.5 text-sm">{t('profileForm.pictureHint')}</p>
        <label
          htmlFor={inputId}
          className="mt-2 inline-block cursor-pointer text-sm font-bold text-heritage underline"
        >
          {t('profileForm.pictureUpload')}
        </label>
        {error && (
          <div className="mt-2">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
      </div>
    </div>
  );
}
