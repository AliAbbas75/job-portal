import axios from 'axios';

/** true until the Flask endpoints exist; set VITE_USE_MOCKS=false in .env to use the real API. */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
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
