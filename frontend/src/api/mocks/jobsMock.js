import { daysUntil } from '../../utils/format';
import { jobs } from './jobsData';
import { bpsRanges, departments, jobCategories, qualificationLevels } from './referenceData';
import { fail, respond } from './store';

const departmentName = (code) => departments.find((d) => d.code === code)?.name ?? code;
const levelRank = (code) => qualificationLevels.find((l) => l.code === code)?.rank ?? 0;

const categoryName = (code) => jobCategories.find((c) => c.code === code)?.name ?? null;

export const withDepartment = (job) => ({
  ...job,
  departmentName: departmentName(job.department),
  categoryName: categoryName(job.category),
  resumeTier: job.bps >= 15, // backend: RESUME_TIER_MIN_BPS
});

export function findJob(id) {
  return jobs.find((j) => j.id === id);
}

function matches(job, filters) {
  const { q, bps, scale, department, category, employmentType, location, qualification, closing } =
    filters;
  if (q) {
    const haystack = [
      job.title,
      job.summary,
      departmentName(job.department),
      job.location,
      `bps-${job.bps} bps ${job.bps}`,
    ]
      .join(' ')
      .toLowerCase();
    if (
      !q
        .toLowerCase()
        .split(/\s+/)
        .every((word) => haystack.includes(word))
    )
      return false;
  }
  if (bps) {
    const range = bpsRanges.find((r) => r.code === bps);
    if (range && (job.bps < range.min || job.bps > range.max)) return false;
  }
  if (scale && job.bps !== Number(scale)) return false;
  if (department && job.department !== department) return false;
  if (category && job.category !== category) return false;
  if (employmentType && job.employmentType !== employmentType) return false;
  if (location && job.location !== location) return false;
  if (qualification && levelRank(job.requirements.minQualification) > levelRank(qualification)) {
    return false;
  }
  if (closing === 'week' && daysUntil(job.closingDate) > 7) return false;
  if (closing === 'month' && daysUntil(job.closingDate) > 30) return false;
  return true;
}

const openJobs = () => jobs.filter((j) => j.status === 'published');

export function listJobs({ sort = 'newest', page = 1, pageSize = 10, ...filters } = {}) {
  const found = openJobs().filter((job) => matches(job, filters));
  found.sort((a, b) =>
    sort === 'closing'
      ? new Date(a.closingDate) - new Date(b.closingDate)
      : new Date(b.publishedAt) - new Date(a.publishedAt),
  );
  const start = (page - 1) * pageSize;
  return respond({
    items: found.slice(start, start + pageSize).map(withDepartment),
    total: found.length,
    page,
    pageSize,
  });
}

export function getJob(id) {
  const job = findJob(id);
  return job ? respond(withDepartment(job)) : fail('not_found');
}

export function getJobStats() {
  const open = openJobs();
  return respond({
    openJobs: open.length,
    vacancies: open.reduce((sum, j) => sum + j.vacancies, 0),
    departments: new Set(open.map((j) => j.department)).size,
    locations: [...new Set(open.map((j) => j.location))].sort(),
    byCategory: jobCategories
      .map(({ code, name }) => ({
        code,
        name,
        count: open.filter((j) => j.category === code).length,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    byBps: [...new Set(open.map((j) => j.bps))]
      .sort((a, b) => b - a)
      .map((bps) => ({ bps, count: open.filter((j) => j.bps === bps).length })),
  });
}
