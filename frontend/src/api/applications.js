import { client, USE_MOCKS } from './client';
import * as mock from './mocks/applicationsMock';

/** Job requirements vs. the candidate's profile: { items, eligible, complete, alreadyAppliedId, jobClosed }. */
export async function getApplicationCheck(jobId) {
  if (USE_MOCKS) return mock.getApplicationCheck(jobId);
  const { data } = await client.get(`/jobs/${jobId}/application-check`);
  return data;
}

/** Wizard steps 1-2: the registered CNIC + mobile; an SMS code is sent. */
export async function requestApplyCode(jobId, { cnic, mobile }) {
  if (USE_MOCKS) return mock.requestApplyCode(jobId, { cnic, mobile });
  const { data } = await client.post(`/jobs/${jobId}/apply-code`, { cnic, mobile });
  return data;
}

/** Returns { applyPass }, which submitApplication needs (valid 30 minutes). */
export async function verifyApplyCode(jobId, otp) {
  if (USE_MOCKS) return mock.verifyApplyCode(jobId, otp);
  const { data } = await client.post(`/jobs/${jobId}/apply-code/verify`, { otp });
  return data;
}

/**
 * Submits and freezes the application: { declarationAccepted, applyPass }. Submitted
 * applications can't be edited or withdrawn.
 */
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

/**
 * The printable bank challan for an application with a fee: { challanNo, applicationId, amount,
 * dueDate, status, candidate { name, cnic }, job { title, advertisementNo }, bank { name,
 * accountTitle, accountNo } }.
 */
export async function getChallan(id) {
  if (USE_MOCKS) return mock.getChallan(id);
  const { data } = await client.get(`/applications/${id}/challan`);
  return data;
}
