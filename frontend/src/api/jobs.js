import { client, USE_MOCKS } from './client';
import * as mock from './mocks/jobsMock';

/** Published jobs matching filters: { q, sort, bps, scale, department, category, employmentType, location, qualification, closing, page, pageSize }. */
export async function searchJobs(params) {
  if (USE_MOCKS) return mock.listJobs(params);
  const { data } = await client.get('/jobs', { params });
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
