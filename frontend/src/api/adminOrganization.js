import { client, USE_MOCKS } from './client';
import * as mock from './mocks/adminOrganizationMock';

/**
 * Organisation profile ("Employer Profile" in the admin panel): { departmentName, cellId, address,
 * website, officerName, email, phone, policyNotes, hasLogo }. Any staff can read; admins save.
 */
export async function getOrganization() {
  if (USE_MOCKS) return mock.getOrganization();
  const { data } = await client.get('/admin/organization');
  return data;
}

export async function updateOrganization(values) {
  if (USE_MOCKS) return mock.updateOrganization(values);
  const { data } = await client.put('/admin/organization', values);
  return data;
}

/** JPG or PNG. Returns the profile (hasLogo true). */
export async function uploadOrganizationLogo(file) {
  if (USE_MOCKS) return mock.uploadOrganizationLogo(file);
  const form = new FormData();
  form.append('file', file);
  const { data } = await client.post('/admin/organization/logo', form);
  return data;
}

/** The logo as a Blob, or null when there is none (or in mock mode). */
export async function getOrganizationLogo() {
  if (USE_MOCKS) return null;
  const { data } = await client.get('/admin/organization/logo', { responseType: 'blob' });
  return data;
}
