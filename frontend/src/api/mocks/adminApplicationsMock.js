// Staff view of applications for mock mode (in memory; resets on reload). Mirrors
// backend/app/services/application_service.py.
import { REJECTED, STATUS_FLOW } from '../../utils/applicationStatuses';
import { currentMockStaff } from './adminAuthMock';
import { fail, respond } from './store';

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString();

function nextStatuses(status) {
  if (status === REJECTED || status === STATUS_FLOW.at(-1)) return [];
  return [...STATUS_FLOW.slice(STATUS_FLOW.indexOf(status) + 1), REJECTED];
}

function applicant(n, name, status, domicile = 'PB', age = 24) {
  const submittedAt = daysAgo(10 - n);
  const events = [{ status: 'submitted', at: submittedAt, note: null }];
  if (status !== 'submitted') events.push({ status, at: daysAgo(2), note: null });
  return {
    id: `PR-2026-00010${n}`,
    jobId: 'j-101',
    submittedAt,
    status,
    events,
    candidate: { name, cnic: `00000-000000${n}-0`, domicile, age },
    fee: {
      amount: 500,
      status: n === 1 ? 'unpaid' : 'paid',
      challanNo: `CH-PR-2026-00010${n}`,
      paidAt: n === 1 ? null : daysAgo(3),
    },
    feeReference: n === 1 ? null : `TXN-00${n}`,
  };
}

let applications = [
  applicant(1, 'Demo Candidate One', 'submitted'),
  applicant(2, 'Demo Candidate Two', 'under_review', 'SD', 26),
  applicant(3, 'Demo Candidate Three', 'shortlisted', 'PB', 22),
];

const withNext = (a) => ({ ...a, nextStatuses: nextStatuses(a.status) });

export function listJobApplications(jobId, { status }) {
  if (!currentMockStaff()) return fail('unauthorized');
  const items = applications
    .filter((a) => a.jobId === String(jobId) && (!status || a.status === status))
    .map(withNext);
  return respond({ items });
}

export function changeApplicationStatus(id, { status, note }) {
  const staff = currentMockStaff();
  if (!staff) return fail('unauthorized');
  if (staff.role !== 'admin') return fail('forbidden');
  const application = applications.find((a) => a.id === id);
  if (!application) return fail('not_found');
  if (!nextStatuses(application.status).includes(status)) return fail('invalid_status_change');
  const updated = {
    ...application,
    status,
    events: [
      ...application.events,
      { status, at: new Date().toISOString(), note: note?.trim() || null },
    ],
  };
  applications = applications.map((a) => (a.id === id ? updated : a));
  return respond(withNext(updated));
}

export function confirmFee(id, { reference }) {
  const staff = currentMockStaff();
  if (!staff) return fail('unauthorized');
  if (staff.role !== 'admin') return fail('forbidden');
  const application = applications.find((a) => a.id === id);
  if (!application) return fail('not_found');
  if (application.fee.status !== 'unpaid') return fail('fee_not_due');
  const updated = {
    ...application,
    fee: { ...application.fee, status: 'paid', paidAt: new Date().toISOString() },
    feeReference: reference.trim(),
  };
  applications = applications.map((a) => (a.id === id ? updated : a));
  return respond(withNext(updated));
}
