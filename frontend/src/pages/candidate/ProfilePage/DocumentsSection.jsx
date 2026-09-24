import { deleteDocument, uploadDocument } from '../../../api/documents';
import { DocumentUpload } from '../../../components/forms/DocumentUpload';
import { t } from '../../../i18n';

const ALWAYS_NEEDED = ['cnic_copy', 'photo'];

export function DocumentsSection({ documents, reference, onChange }) {
  async function upload(type, file) {
    const doc = await uploadDocument(type, file);
    onChange([...documents.filter((d) => d.type !== type), doc]);
  }

  async function remove(doc) {
    await deleteDocument(doc.id);
    onChange(documents.filter((d) => d.id !== doc.id));
  }

  return (
    <div>
      <p>{t('profile.documentsLead')}</p>
      {(reference?.documentTypes ?? []).map((type) => {
        const doc = documents.find((d) => d.type === type.code);
        return (
          <DocumentUpload
            key={type.code}
            label={type.name}
            document={doc}
            required={ALWAYS_NEEDED.includes(type.code)}
            onUpload={(file) => upload(type.code, file)}
            onDelete={doc ? () => remove(doc) : undefined}
          />
        );
      })}
    </div>
  );
}
