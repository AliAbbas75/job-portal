import { client, USE_MOCKS } from './client';
import * as mock from './mocks/adminApplicationsMock';

/**
 * Staff view of applications (T-065). An item: the candidate application fields plus
 * candidate { name, cnic, domicile, age }, snapshot (frozen profile) and nextStatuses.
 */
export async function listJobApplications(jobId, { status = '' } = {}) {
  if (USE_MOCKS) return mock.listJobApplications(jobId, { status });
  const { data } = await client.get(`/admin/jobs/${jobId}/applications`, {
    params: status ? { status } : {},
  });
  return data;
}

/** Admins only. status must be one of the application's nextStatuses. */
export async function changeApplicationStatus(applicationId, { status, note }) {
  if (USE_MOCKS) return mock.changeApplicationStatus(applicationId, { status, note });
  const { data } = await client.post(`/admin/applications/${applicationId}/status`, {
    status,
    note,
  });
  return data;
}

/** Admins only: the bank confirmed the fee. reference: bank transaction or challan number. */
export async function confirmFee(applicationId, { reference }) {
  if (USE_MOCKS) return mock.confirmFee(applicationId, { reference });
  const { data } = await client.post(`/admin/applications/${applicationId}/fee`, { reference });
  return data;
}
