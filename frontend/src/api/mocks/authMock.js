import { seedDemoApplication } from './applicationsMock';
import { emptyProfile } from './profileMock';
import { fail, getDb, nextSeq, respond, save } from './store';

/** Fixed OTP in mock mode; the real one is sent by SMS (T-021). */
export const MOCK_OTP = '123456';

const normalizeMobile = (mobile) => mobile.replace('-', '');

function findAccount(cnic) {
  return getDb().accounts[cnic];
}

export function requestOtp({ purpose, cnic, mobile }) {
  const account = findAccount(cnic);
  if (purpose === 'signup' && account) return fail('cnic_taken');
  if (purpose === 'login' && (!account || account.mobile !== normalizeMobile(mobile))) {
    return fail('account_not_found');
  }
  return respond({ expiresInSeconds: 300 });
}

function sessionFor(account) {
  const db = getDb();
  db.session = account.candidateId;
  save();
  const name = db.profiles[account.candidateId]?.personal.fullName ?? '';
  return {
    token: `mock-token-${account.candidateId}`,
    candidate: { id: account.candidateId, cnic: account.cnic, name },
  };
}

export function verifyOtp({ purpose, cnic, mobile, otp }) {
  if (otp !== MOCK_OTP) return fail('invalid_otp');
  const db = getDb();

  if (purpose === 'login') {
    const account = findAccount(cnic);
    return account ? respond(sessionFor(account)) : fail('account_not_found');
  }

  if (findAccount(cnic)) return fail('cnic_taken');
  const account = { candidateId: `c-${nextSeq()}`, cnic, mobile: normalizeMobile(mobile) };
  db.accounts[cnic] = account;
  db.profiles[account.candidateId] = emptyProfile(account);
  db.documents[account.candidateId] = [];
  db.applications[account.candidateId] = [seedDemoApplication()];
  save();
  return respond(sessionFor(account));
}

export function getSession() {
  const db = getDb();
  const account = Object.values(db.accounts).find((a) => a.candidateId === db.session);
  return account ? respond(sessionFor(account)) : fail('unauthorized');
}

export function logout() {
  getDb().session = null;
  save();
  return respond({});
}
