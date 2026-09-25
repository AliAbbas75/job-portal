import { client, USE_MOCKS } from './client';
import * as mock from './mocks/adminJobsMock';

/**
 * Staff job workflow (M3). A job: the public job fields plus status ('draft' |
 * 'pending_approval' | 'returned' | 'rejected' | 'approved' | 'published' | 'closed'), live,
 * createdBy, approvedAt, requisitionRef, ageCutoffDate and approvals [{ approver, approverId,
 * action, comments, at }].
 */
export async function listAdminJobs({ status = '' } = {}) {
  if (USE_MOCKS) return mock.listAdminJobs({ status });
  const { data } = await client.get('/admin/jobs', { params: status ? { status } : {} });
  return data;
}

export async function getAdminJob(id) {
  if (USE_MOCKS) return mock.getAdminJob(id);
  const { data } = await client.get(`/admin/jobs/${id}`);
  return data;
}

/** job: see JobInput in backend/app/schemas/admin_job_schema.py. */
export async function createJob(job) {
  if (USE_MOCKS) return mock.createJob(job);
  const { data } = await client.post('/admin/jobs', job);
  return data;
}

export async function updateJob(id, job) {
  if (USE_MOCKS) return mock.updateJob(id, job);
  const { data } = await client.put(`/admin/jobs/${id}`, job);
  return data;
}

export async function submitJob(id) {
  if (USE_MOCKS) return mock.submitJob(id);
  const { data } = await client.post(`/admin/jobs/${id}/submit`);
  return data;
}

/** action: 'approved' | 'returned' | 'rejected'. Returning or rejecting needs comments. */
export async function decideJob(id, { action, comments }) {
  if (USE_MOCKS) return mock.decideJob(id, { action, comments });
  const { data } = await client.post(`/admin/jobs/${id}/decision`, { action, comments });
  return data;
}

export async function publishJob(id, { advertisementNo }) {
  if (USE_MOCKS) return mock.publishJob(id, { advertisementNo });
  const { data } = await client.post(`/admin/jobs/${id}/publish`, { advertisementNo });
  return data;
}

/**
 * The admin panel's quick "Create job" form: { title, department (code), bps, vacancies,
 * closingDate ('YYYY-MM-DD'), description, quotaSelection: ['open_merit' | 'railway_employee_child'
 * | 'women' | 'minority' | 'disability' | 'punjab' | 'sindh' | 'khyber_pakhtunkhwa' |
 * 'balochistan'], kpis: [{ title, target }] }. Creates a draft (status 'draft', requirements
 * null); complete it with updateJob before submitJob.
 */
export async function createRequisition(values) {
  if (USE_MOCKS) return mock.createRequisition(values);
  const { data } = await client.post('/admin/jobs/requisitions', values);
  return data;
}
