import { client, USE_MOCKS } from './client';
import * as mock from './mocks/authMock';

/** purpose: 'signup' | 'login'. Sends an OTP to the mobile number. */
export async function requestOtp({ purpose, cnic, mobile }) {
  if (USE_MOCKS) return mock.requestOtp({ purpose, cnic, mobile });
  const { data } = await client.post(`/auth/${purpose}/otp`, { cnic, mobile });
  return data;
}

/** Returns { token, candidate }. Signup creates the permanent profile. */
export async function verifyOtp({ purpose, cnic, mobile, otp }) {
  if (USE_MOCKS) return mock.verifyOtp({ purpose, cnic, mobile, otp });
  const { data } = await client.post(`/auth/${purpose}/verify`, { cnic, mobile, otp });
  return data;
}

export async function getSession() {
  if (USE_MOCKS) return mock.getSession();
  const { data } = await client.get('/auth/session');
  return data;
}

export async function logout() {
  if (USE_MOCKS) return mock.logout();
  await client.post('/auth/logout');
  return {};
}
