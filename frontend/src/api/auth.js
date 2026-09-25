import { client, USE_MOCKS } from './client';
import * as mock from './mocks/authMock';

/**
 * purpose: 'signup' | 'login'. Sends an OTP to the mobile number. operator ('jazz' | 'telenor' |
 * 'ufone' | 'zong') is required for signup; captchaToken comes from the Captcha field.
 */
export async function requestOtp({ purpose, cnic, mobile, operator, captchaToken }) {
  if (USE_MOCKS) return mock.requestOtp({ purpose, cnic, mobile, operator });
  const { data } = await client.post(`/auth/${purpose}/otp`, {
    cnic,
    mobile,
    operator: operator || null,
    captchaToken,
  });
  return data;
}

/** Returns { token, candidate }. Signup creates the permanent profile. remember: 30-day login. */
export async function verifyOtp({ purpose, cnic, mobile, otp, operator, remember = false }) {
  if (USE_MOCKS) return mock.verifyOtp({ purpose, cnic, mobile, otp, operator });
  const { data } = await client.post(`/auth/${purpose}/verify`, {
    cnic,
    mobile,
    otp,
    operator: operator || null,
    remember,
  });
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
