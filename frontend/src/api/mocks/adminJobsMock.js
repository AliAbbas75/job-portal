// Staff job workflow for mock mode (in memory; resets on reload). Mirrors the rules in
// backend/app/services/admin_job_service.py with one approval required.
import { currentMockStaff } from './adminAuthMock';
import { jobs as publicJobs } from './jobsData';
import { withDepartment } from './jobsMock';
import { fail, respond } from './store';

const EDITABLE = ['draft', 'returned'];
const CREATORS = ['job_creator', 'admin'];
const APPROVERS = ['approver', 'admin'];

let nextId = 500;

function seed() {
  const published = publicJobs.map((job) => ({
    ...job,
    live: job.status === 'published',
    createdBy: 's-3',
    approvedAt: job.publishedAt,
    requisitionRef: null,
    ageCutoffDate: null,
    approvals: [
      {
        approver: 'Demo Approver',
        approverId: 's-2',
        action: 'approved',
        comments: null,
        at: job.publishedAt,
      },
    ],
  }));
  const [template] = publicJobs;
  const draft = (id, title, status, approvals = []) => ({
    ...template,
    id,
    title,
    status,
    live: false,
    advertisementNo: null,
    publishedAt: null,
    approvedAt: null,
    createdBy: 's-3',
    requisitionRef: null,
    ageCutoffDate: null,
    approvals,
  });
  return [
    draft('j-201', 'Assistant Station Master (Sukkur)', 'pending_approval'),
    draft('j-202', 'Assistant Station Master (Quetta)', 'draft'),
    ...published,
  ];
}

let jobs = seed();

function find(id) {
  return jobs.find((job) => String(job.id) === String(id));
}

/** Runs `change` on the job if the logged-in mock staff user has one of `roles`. */
function act(id, roles, change) {
  const staff = currentMockStaff();
  if (!staff) return fail('unauthorized');
  if (!roles.includes(staff.role)) return fail('forbidden');
  const job = find(id);
  if (!job) return fail('not_found');
  const error = change(job, staff);
  return error ? fail(error) : respond(withDepartment(job));
}

export function listAdminJobs({ status }) {
  if (!currentMockStaff()) return fail('unauthorized');
  const items = jobs
    .filter((job) => !status || job.status === status)
    .map((job) => ({ ...withDepartment(job), applicantsCount: job.id === 'j-101' ? 3 : 0 }));
  return respond({ items });
}

export function getAdminJob(id) {
  if (!currentMockStaff()) return fail('unauthorized');
  const job = find(id);
  return job ? respond(withDepartment(job)) : fail('not_found');
}

export function createJob(input) {
  const staff = currentMockStaff();
  if (!staff) return fail('unauthorized');
  if (!CREATORS.includes(staff.role)) return fail('forbidden');
  const job = {
    ...input,
    id: `j-${(nextId += 1)}`,
    status: 'draft',
    live: false,
    advertisementNo: null,
    publishedAt: null,
    approvedAt: null,
    createdBy: staff.id,
    approvals: [],
  };
  jobs = [job, ...jobs];
  return respond(withDepartment(job));
}

export function updateJob(id, input) {
  return act(id, CREATORS, (job) => {
    if (!EDITABLE.includes(job.status)) return 'job_locked';
    Object.assign(job, input);
    return null;
  });
}

export function submitJob(id) {
  return act(id, CREATORS, (job) => {
    if (!EDITABLE.includes(job.status)) return 'invalid_status';
    if (!job.requirements || !job.location || !job.quotas.length) return 'validation_error';
    job.status = 'pending_approval';
    return null;
  });
}

export function decideJob(id, { action, comments }) {
  return act(id, APPROVERS, (job, staff) => {
    if (job.status !== 'pending_approval') return 'invalid_status';
    if (job.createdBy === staff.id) return 'own_job';
    if (action !== 'approved' && !comments?.trim()) return 'validation_error';
    job.approvals = [
      ...job.approvals,
      {
        approver: staff.name,
        approverId: staff.id,
        action,
        comments: comments?.trim() || null,
        at: new Date().toISOString(),
      },
    ];
    job.status = action;
    if (action === 'approved') job.approvedAt = new Date().toISOString();
    return null;
  });
}

export function publishJob(id, { advertisementNo }) {
  return act(id, ['admin'], (job) => {
    if (job.status !== 'approved') return 'invalid_status';
    job.status = 'published';
    job.publishedAt = new Date().toISOString();
    job.advertisementNo = advertisementNo?.trim() || `PR/REC/${new Date().getFullYear()}/${job.id}`;
    job.live = new Date(job.openingDate) <= new Date() && new Date() < new Date(job.closingDate);
    return null;
  });
}

export function createRequisition(values) {
  const staff = currentMockStaff();
  if (!staff) return fail('unauthorized');
  if (!CREATORS.includes(staff.role)) return fail('forbidden');
  const job = {
    id: `j-${(nextId += 1)}`,
    title: values.title,
    department: values.department,
    bps: values.bps,
    vacancies: values.vacancies,
    employmentType: 'permanent',
    location: null,
    summary: null,
    description: values.description ?? null,
    openingDate: null,
    closingDate: values.closingDate ? `${values.closingDate}T23:59:59+05:00` : null,
    fee: 0,
    status: 'draft',
    live: false,
    advertisementNo: null,
    publishedAt: null,
    approvedAt: null,
    createdBy: staff.id,
    requirements: null,
    quotas: [],
    requisition: { quotaSelection: values.quotaSelection ?? [], kpis: values.kpis ?? [] },
    approvals: [],
  };
  jobs = [job, ...jobs];
  return respond(withDepartment(job));
}
