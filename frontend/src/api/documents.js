import { client, USE_MOCKS } from './client';
import * as mock from './mocks/documentsMock';

export const MAX_FILE_BYTES = mock.MAX_FILE_BYTES;
export const ALLOWED_FILE_TYPES = mock.ALLOWED_TYPES;

export async function listDocuments() {
  if (USE_MOCKS) return mock.listDocuments();
  const { data } = await client.get('/documents');
  return data;
}

/** Uploads to the candidate's vault. A new file of the same type replaces the old one. */
export async function uploadDocument(type, file) {
  if (USE_MOCKS) return mock.uploadDocument(type, file);
  const form = new FormData();
  form.append('type', type);
  form.append('file', file);
  const { data } = await client.post('/documents', form);
  return data;
}

/** The file itself as a Blob (e.g. the photo shown as the profile picture). Null in mock mode. */
export async function getDocumentFile(id) {
  if (USE_MOCKS) return null;
  const { data } = await client.get(`/documents/${id}/file`, { responseType: 'blob' });
  return data;
}

export async function deleteDocument(id) {
  if (USE_MOCKS) return mock.deleteDocument(id);
  await client.delete(`/documents/${id}`);
  return {};
}
