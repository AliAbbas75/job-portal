import { client, USE_MOCKS } from './client';
import * as mock from './mocks/profileMock';

export async function getProfile() {
  if (USE_MOCKS) return mock.getProfile();
  const { data } = await client.get('/profile');
  return data;
}

/**
 * Saves the one-page profile form: { fullName, fatherName, dob, gender, province, district,
 * email, address, highestQualification, tradeCertificate, quota, ageRelaxation } (codes for the
 * dropdowns). Returns the full profile.
 */
export async function updateProfile(values) {
  if (USE_MOCKS) return mock.updateSection('summary', values);
  const { data } = await client.put('/profile/summary', values);
  return data;
}

/**
 * section: 'personal' | 'contact' | 'domicile' | 'additional' | 'skills' | 'statement'
 * ({ statementOfPurpose }, BPS-15+). Returns the full profile.
 */
export async function updateProfileSection(section, values) {
  if (USE_MOCKS) return mock.updateSection(section, values);
  const { data } = await client.put(`/profile/${section}`, values);
  return data;
}

/**
 * section: 'education' | 'experience', or for BPS-15+ 'registrations' ({ body, registrationNo,
 * validUntil }), 'publications' ({ title, venue, year, url }), 'references' ({ name,
 * designation, organization, phone, email }). Creates when item.id is empty. Returns the full
 * profile.
 */
export async function saveProfileItem(section, item) {
  if (USE_MOCKS) return mock.saveListItem(section, item);
  const { data } = item.id
    ? await client.put(`/profile/${section}/${item.id}`, item)
    : await client.post(`/profile/${section}`, item);
  return data;
}

export async function deleteProfileItem(section, id) {
  if (USE_MOCKS) return mock.deleteListItem(section, id);
  const { data } = await client.delete(`/profile/${section}/${id}`);
  return data;
}
