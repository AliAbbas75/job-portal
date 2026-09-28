import { client, setAuthToken, setUnauthorizedHandler } from './client';

// An adapter that answers like Flask does when the login token has expired.
const expired = (config) =>
  Promise.reject(
    Object.assign(new Error('Request failed with status code 401'), {
      config,
      response: { status: 401, data: { code: 'unauthorized', message: 'Your session has ended.' } },
    }),
  );

describe('api client', () => {
  const handler = vi.fn();

  beforeEach(() => {
    handler.mockClear();
    setAuthToken('candidate-token');
    setUnauthorizedHandler(handler);
  });

  afterEach(() => {
    setAuthToken(null);
    setUnauthorizedHandler(null);
  });

  it('reports an ended candidate session', async () => {
    await expect(client.get('/profile', { adapter: expired })).rejects.toMatchObject({
      code: 'unauthorized',
    });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('leaves staff requests to the staff login', async () => {
    await expect(client.get('/admin/jobs', { adapter: expired })).rejects.toBeTruthy();
    expect(handler).not.toHaveBeenCalled();
  });
});
