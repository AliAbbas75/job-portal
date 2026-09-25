import { fail, getDb, nextSeq, respond, save, sessionCandidateId } from './store';

const FIELD_SECTIONS = ['personal', 'contact', 'domicile', 'additional'];
// BPS-15+ tier (M5): registrations, publications, references.
const LIST_SECTIONS = ['education', 'experience', 'registrations', 'publications', 'references'];

export function emptyProfile(account) {
  return {
    personal: {
      fullName: '',
      fatherName: '',
      cnic: account.cnic,
      dob: '',
      gender: '',
      nationality: 'Pakistani',
    },
    contact: { mobile: account.mobile, email: '', currentAddress: '', permanentAddress: '' },
    domicile: { province: '', district: '' },
    education: [],
    experience: [],
    skills: [],
    additional: { governmentEmployee: false, disability: false, minority: false },
    claims: { highestQualification: '', tradeCertificate: '', quota: '', ageRelaxation: '' },
    registrations: [],
    publications: [],
    references: [],
    statementOfPurpose: '',
  };
}

/** Profile of the logged-in candidate, or null. Used by other mocks too. */
export function currentProfile() {
  const id = sessionCandidateId();
  return id ? getDb().profiles[id] : null;
}

export function getProfile() {
  const profile = currentProfile();
  return profile ? respond(profile) : fail('unauthorized');
}

export function updateSection(section, data) {
  const profile = currentProfile();
  if (!profile) return fail('unauthorized');
  if (section === 'skills') {
    profile.skills = data;
  } else if (section === 'statement') {
    profile.statementOfPurpose = data.statementOfPurpose;
  } else if (section === 'summary') {
    profile.personal = {
      ...profile.personal,
      fullName: data.fullName,
      fatherName: data.fatherName,
      dob: data.dob,
      gender: data.gender,
    };
    profile.contact = {
      ...profile.contact,
      email: data.email ?? '',
      currentAddress: data.address,
      permanentAddress: profile.contact.permanentAddress || data.address,
    };
    profile.domicile = { province: data.province, district: data.district };
    profile.claims = {
      highestQualification: data.highestQualification,
      tradeCertificate: data.tradeCertificate,
      quota: data.quota,
      ageRelaxation: data.ageRelaxation,
    };
  } else if (FIELD_SECTIONS.includes(section)) {
    // CNIC and mobile are fixed at signup.
    const { cnic: _cnic, mobile: _mobile, ...editable } = data;
    profile[section] = { ...profile[section], ...editable };
  } else {
    return fail('not_found');
  }
  save();
  return respond(profile);
}

export function saveListItem(section, item) {
  const profile = currentProfile();
  if (!profile) return fail('unauthorized');
  if (!LIST_SECTIONS.includes(section)) return fail('not_found');
  profile[section] ??= []; // profiles saved before M5
  const list = profile[section];
  if (item.id) {
    const index = list.findIndex((entry) => entry.id === item.id);
    if (index === -1) return fail('not_found');
    list[index] = item;
  } else {
    list.push({ ...item, id: `${section}-${nextSeq()}` });
  }
  save();
  return respond(profile);
}

export function deleteListItem(section, id) {
  const profile = currentProfile();
  if (!profile) return fail('unauthorized');
  if (!LIST_SECTIONS.includes(section)) return fail('not_found');
  profile[section] = profile[section].filter((entry) => entry.id !== id);
  save();
  return respond(profile);
}
