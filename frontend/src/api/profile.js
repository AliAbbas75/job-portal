import { client, USE_MOCKS } from './client';
import * as mock from './mocks/profileMock';

export async function getProfile() {
  if (USE_MOCKS) return mock.getProfile();
  try {
    const { data } = await client.get('/profile');
    return data;
  } catch {
    return mock.getProfile();
  }
}

export async function updateProfile(values) {
  if (USE_MOCKS) return mock.updateSection('personal', values);
  try {
    const { data } = await client.put('/profile/personal', values);
    return data;
  } catch {
    return values;
  }
}

/** section: 'personal' | 'contact' | 'domicile' | 'additional' | 'skills'. Returns the full profile. */
export async function updateProfileSection(section, values) {
  if (USE_MOCKS) return mock.updateSection(section, values);
  const { data } = await client.put(`/profile/${section}`, values);
  return data;
}

/** section: 'education' | 'experience'. Creates when item.id is empty. Returns the full profile. */
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
