import axios from 'axios';

/** true until the Flask endpoints exist; set VITE_USE_MOCKS=false in .env to use the real API. */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

// Candidates and staff log in separately; /admin/* requests carry the staff token.
let authToken = null;
let staffToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function setStaffToken(token) {
  staffToken = token;
}

export const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  const token = config.url?.startsWith('/admin/') ? staffToken : authToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Error shape used across the app, from either Axios or the mock layer. */
export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const body = error.response?.data ?? {};
    return Promise.reject(
      new ApiError(body.code ?? 'network_error', body.message ?? error.message),
    );
  },
);
