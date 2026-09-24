import { client, USE_MOCKS } from './client';
import * as mock from './mocks/applicationsMock';

/** Job requirements vs. the candidate's profile: { items, eligible, complete, alreadyAppliedId, jobClosed }. */
export async function getApplicationCheck(jobId) {
  if (USE_MOCKS) return mock.getApplicationCheck(jobId);
  const { data } = await client.get(`/jobs/${jobId}/application-check`);
  return data;
}

/** Submits and freezes the application. Submitted applications can't be edited or withdrawn. */
export async function submitApplication(jobId, payload) {
  if (USE_MOCKS) return mock.submitApplication(jobId, payload);
  const { data } = await client.post(`/jobs/${jobId}/applications`, payload);
  return data;
}

export async function listMyApplications() {
  if (USE_MOCKS) return mock.listApplications();
  const { data } = await client.get('/applications');
  return data;
}

export async function getApplication(id) {
  if (USE_MOCKS) return mock.getApplication(id);
  const { data } = await client.get(`/applications/${id}`);
  return data;
}
