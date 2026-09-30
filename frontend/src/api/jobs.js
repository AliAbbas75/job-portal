import { client, USE_MOCKS } from './client';
import * as mock from './mocks/jobsMock';

/** Published jobs matching filters: { q, sort, bps, scale, department, category, employmentType, location, qualification, closing, page, pageSize }. */
export async function searchJobs(params) {
  if (USE_MOCKS) return mock.listJobs(params);
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
  );
  const { data } = await client.get('/jobs', { params: cleanParams });
  return data;
}

export async function getJob(id) {
  if (USE_MOCKS) return mock.getJob(id);
  const { data } = await client.get(`/jobs/${id}`);
  return data;
}

/** Counts for the landing page: { openJobs, vacancies, departments, locations, byCategory [{ code, name, count }], byBps [{ bps, count }] }. */
export async function getJobStats() {
  if (USE_MOCKS) return mock.getJobStats();
  const { data } = await client.get('/jobs/stats');
  return data;
}

/** Link to a published job's newspaper advertisement (public; only when job.hasAdvertisement). */
export const advertisementUrl = (id) => `/api/jobs/${id}/advertisement`;
