import { useState } from 'react';
import { uploadDocument } from '../../../api/documents';
import { Alert } from '../../../components/common/Alert';
import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';
import { compressImage } from '../../../utils/compressImage';
import { cx } from '../../../utils/cx';
import { errorMessage } from '../../../utils/errorMessage';
import { formatFileSize } from '../../../utils/format';
import { documentName } from '../../../utils/referenceLabels';

/** The documents this application needs: the job's list plus proofs for the candidate's claims. */
function neededTypes(check, claims) {
  const types = check.items
    .filter((item) => item.key === 'document')
    .map((item) => item.documentType);
  if (claims?.tradeCertificate && claims.tradeCertificate !== 'none')
    types.push('trade_certificate');
  if (claims?.quota && claims.quota !== 'open_merit') types.push('quota_proof');
  if (claims?.ageRelaxation && claims.ageRelaxation !== 'none') types.push('age_relaxation_proof');
  return [...new Set(types)];
}

/** Wizard step 4: upload or replace each document (stored in the candidate's vault). */
export function DocumentsStep({ check, claims, documents, reference, onChange }) {
  const [busyType, setBusyType] = useState(null);
  const [error, setError] = useState(null);

  async function upload(type, file) {
    setBusyType(type);
    setError(null);
    try {
      const doc = await uploadDocument(type, await compressImage(file));
      onChange([...documents.filter((d) => d.type !== type), doc]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyType(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert variant="error">{error}</Alert>}
      <ul className="flex flex-col gap-3">
        {neededTypes(check, claims).map((type) => {
          const doc = documents.find((d) => d.type === type);
          const inputId = `upload-${type}`;
          return (
            <li
              key={type}
              className={cx(
                'flex items-center justify-between gap-3 rounded-md border p-3.5',
                doc ? 'border-heritage bg-surface' : 'border-surface bg-white',
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cx(
                    'flex size-8 flex-none items-center justify-center rounded-full',
                    doc ? 'bg-heritage text-white' : 'bg-cream text-heritage',
                  )}
                >
                  <Icon name={doc ? 'check' : 'file'} size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{documentName(reference, type)}</p>
                  <p className="truncate text-xs">
                    {doc
                      ? `${doc.fileName} · ${formatFileSize(doc.size)} · ${t('wizard.uploaded')}`
                      : t('wizard.fileRule')}
                  </p>
                </div>
              </div>
              <label
                htmlFor={inputId}
                className={cx(
                  'flex-none cursor-pointer rounded-sm border border-heritage bg-white px-4 py-1.5 text-sm font-bold text-heritage hover:bg-cream',
                  busyType === type && 'pointer-events-none opacity-50',
                )}
              >
                <Icon name="upload" size={14} className="mr-1 inline" />
                {doc ? t('wizard.replace') : t('wizard.upload')}
                <span className="sr-only">: {documentName(reference, type)}</span>
              </label>
              <input
                id={inputId}
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) upload(type, file);
                }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
