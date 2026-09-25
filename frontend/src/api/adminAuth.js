import { client, USE_MOCKS } from './client';
import * as mock from './mocks/adminAuthMock';

/** Returns { token, staff }. staff: { id, name, email, role, department }. */
export async function staffLogin({ email, password }) {
  if (USE_MOCKS) return mock.staffLogin({ email, password });
  const { data } = await client.post('/admin/auth/login', { email, password });
  return data;
}

export async function getStaffSession() {
  if (USE_MOCKS) return mock.getStaffSession();
  const { data } = await client.get('/admin/auth/session');
  return data;
}

export async function staffLogout() {
  if (USE_MOCKS) return mock.staffLogout();
  await client.post('/admin/auth/logout');
  return {};
}
