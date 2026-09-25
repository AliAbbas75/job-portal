import { fail, respond } from './store';

/** Demo staff accounts for mock mode. Real accounts are made with `flask create-staff`. */
export const MOCK_STAFF_PASSWORD = 'demo-password';

const STAFF = [
  { id: 's-1', name: 'Demo Admin', email: 'admin@example.com', role: 'admin', department: null },
  {
    id: 's-2',
    name: 'Demo Approver',
    email: 'approver@example.com',
    role: 'approver',
    department: null,
  },
  {
    id: 's-3',
    name: 'Demo Job Creator',
    email: 'creator@example.com',
    role: 'job_creator',
    department: 'TRF',
  },
];

let sessionId = null;

export function staffLogin({ email, password }) {
  const staff = STAFF.find((s) => s.email === email.trim().toLowerCase());
  if (!staff || password !== MOCK_STAFF_PASSWORD) return fail('invalid_credentials');
  sessionId = staff.id;
  return respond({ token: `mock-staff-token-${staff.id}`, staff });
}

export function getStaffSession() {
  const staff = STAFF.find((s) => s.id === sessionId);
  return staff ? respond({ staff }) : fail('unauthorized');
}

export function staffLogout() {
  sessionId = null;
  return respond({});
}
