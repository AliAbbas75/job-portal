import { fail, getDb, nextSeq, respond, save, sessionCandidateId } from './store';

export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/** Vault of the logged-in candidate, or null. Only metadata is kept in mock mode. */
export function currentDocuments() {
  const id = sessionCandidateId();
  return id ? getDb().documents[id] : null;
}

export function listDocuments() {
  const docs = currentDocuments();
  return docs ? respond(docs) : fail('unauthorized');
}

export function uploadDocument(type, file) {
  const docs = currentDocuments();
  if (!docs) return fail('unauthorized');
  if (!ALLOWED_TYPES.includes(file.type)) return fail('file_type_not_allowed');
  if (file.size > MAX_FILE_BYTES) return fail('file_too_large');

  const doc = {
    id: `doc-${nextSeq()}`,
    type,
    fileName: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
  // One current document per type: a new upload replaces the old one.
  const index = docs.findIndex((d) => d.type === type);
  if (index === -1) docs.push(doc);
  else docs[index] = doc;
  save();
  return respond(doc);
}

export function deleteDocument(id) {
  const docs = currentDocuments();
  if (!docs) return fail('unauthorized');
  const index = docs.findIndex((d) => d.id === id);
  if (index === -1) return fail('not_found');
  docs.splice(index, 1);
  save();
  return respond({});
}
