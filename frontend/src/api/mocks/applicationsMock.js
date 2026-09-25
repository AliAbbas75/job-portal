import { currentDocuments } from './documentsMock';
import { checkEligibility } from './eligibilityMock';
import { findJob, withDepartment } from './jobsMock';
import { currentProfile } from './profileMock';
import { fail, getDb, nextSeq, respond, save, sessionCandidateId } from './store';

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString();

/** A past application to a closed job, so new demo accounts can see the tracking timeline. */
export function seedDemoApplication() {
  return {
    id: 'PR-2026-000090',
    jobId: 'j-090',
    submittedAt: daysAgo(40),
    status: 'shortlisted',
    events: [
      { status: 'submitted', at: daysAgo(40) },
      { status: 'under_review', at: daysAgo(25) },
      { status: 'shortlisted', at: daysAgo(5), note: 'Written test schedule will be sent by SMS.' },
    ],
  };
}

function currentApplications() {
  const id = sessionCandidateId();
  return id ? getDb().applications[id] : null;
}

function withJob(application) {
  const { title, department, departmentName, bps, location, closingDate } = withDepartment(
    findJob(application.jobId),
  );
  return {
    ...application,
    job: { id: application.jobId, title, department, departmentName, bps, location, closingDate },
  };
}

export function getApplicationCheck(jobId) {
  const profile = currentProfile();
  if (!profile) return fail('unauthorized');
  const job = findJob(jobId);
  if (!job) return fail('not_found');
  const existing = currentApplications().find((a) => a.jobId === jobId);
  return respond({
    ...checkEligibility(job, profile, currentDocuments()),
    alreadyAppliedId: existing?.id ?? null,
    jobClosed: job.status !== 'published',
  });
}

export const MOCK_APPLY_PASS = 'mock-apply-pass';

export function requestApplyCode(jobId, { cnic, mobile }) {
  const profile = currentProfile();
  if (!profile) return fail('unauthorized');
  const registered = profile.contact.mobile.replace(/\D/g, '');
  if (cnic !== profile.personal.cnic || mobile.replace(/\D/g, '') !== registered) {
    return fail('identity_mismatch');
  }
  return respond({ expiresInSeconds: 300 });
}

export function verifyApplyCode(jobId, otp) {
  if (!currentProfile()) return fail('unauthorized');
  return otp === '123456' ? respond({ applyPass: MOCK_APPLY_PASS }) : fail('invalid_otp');
}

export function submitApplication(jobId, { declarationAccepted, applyPass }) {
  const profile = currentProfile();
  if (!profile) return fail('unauthorized');
  const job = findJob(jobId);
  if (!job) return fail('not_found');
  if (job.status !== 'published') return fail('job_closed');
  const applications = currentApplications();
  if (applications.some((a) => a.jobId === jobId)) return fail('already_applied');
  if (applyPass !== MOCK_APPLY_PASS) return fail('identity_check_required');
  if (!declarationAccepted) return fail('declaration_required');

  const documents = currentDocuments();
  const check = checkEligibility(job, profile, documents);
  if (!check.complete) return fail('requirements_incomplete');

  const submittedAt = new Date().toISOString();
  const application = {
    id: `PR-${new Date().getFullYear()}-${String(nextSeq()).padStart(6, '0')}`,
    jobId,
    submittedAt,
    status: 'submitted',
    events: [{ status: 'submitted', at: submittedAt }],
    // Frozen copy: later profile edits don't change a submitted application.
    snapshot: {
      profile: structuredClone(profile),
      documents: documents.filter((d) => job.requirements.documents.includes(d.type)),
    },
  };
  applications.push(application);
  save();
  return respond(withJob(application));
}

export function listApplications() {
  const applications = currentApplications();
  if (!applications) return fail('unauthorized');
  const summaries = applications
    .map(({ snapshot: _snapshot, ...rest }) => withJob(rest))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  return respond(summaries);
}

export function getApplication(id) {
  const applications = currentApplications();
  if (!applications) return fail('unauthorized');
  const application = applications.find((a) => a.id === id);
  return application ? respond(withJob(application)) : fail('not_found');
}
