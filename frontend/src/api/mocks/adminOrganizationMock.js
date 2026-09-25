// Organisation profile for mock mode (in memory). Mirrors backend/app/services/organization_service.py.
import { currentMockStaff } from './adminAuthMock';
import { fail, respond } from './store';

let profile = {
  departmentName: 'Pakistan Railways Headquarters',
  cellId: '',
  address: 'Empress Road, Lahore, Punjab',
  website: 'https://pakrail.gov.pk',
  officerName: '',
  email: 'info@pakrail.gov.pk',
  phone: '042-99201938',
  policyNotes: '',
  hasLogo: false,
};

export function getOrganization() {
  return currentMockStaff() ? respond(profile) : fail('unauthorized');
}

function asAdmin(change) {
  const staff = currentMockStaff();
  if (!staff) return fail('unauthorized');
  if (staff.role !== 'admin') return fail('forbidden');
  change();
  return respond(profile);
}

export function updateOrganization(values) {
  return asAdmin(() => {
    profile = { ...profile, ...values, hasLogo: profile.hasLogo };
  });
}

export function uploadOrganizationLogo(file) {
  if (!['image/jpeg', 'image/png'].includes(file.type)) return fail('file_type_not_allowed');
  return asAdmin(() => {
    profile = { ...profile, hasLogo: true };
  });
}
