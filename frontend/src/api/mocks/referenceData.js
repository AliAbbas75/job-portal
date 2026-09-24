// Reference lists. The real values come from the backend seed data (T-018).

export const departments = [
  { code: 'TRF', name: 'Traffic & Operations' },
  { code: 'CIV', name: 'Civil Engineering' },
  { code: 'MEC', name: 'Mechanical Engineering' },
  { code: 'ELE', name: 'Electrical Engineering' },
  { code: 'SNT', name: 'Signal & Telecom' },
  { code: 'COM', name: 'Commercial' },
  { code: 'MED', name: 'Medical Services' },
  { code: 'ITD', name: 'Information Technology' },
  { code: 'ACC', name: 'Accounts & Finance' },
];

export const provinces = [
  {
    code: 'PB',
    name: 'Punjab',
    districts: ['Lahore', 'Rawalpindi', 'Multan', 'Faisalabad', 'Bahawalpur'],
  },
  { code: 'SD', name: 'Sindh', districts: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana'] },
  {
    code: 'KP',
    name: 'Khyber Pakhtunkhwa',
    districts: ['Peshawar', 'Mardan', 'Kohat', 'Abbottabad'],
  },
  { code: 'BA', name: 'Balochistan', districts: ['Quetta', 'Sibi', 'Khuzdar'] },
  { code: 'IS', name: 'Islamabad Capital Territory', districts: ['Islamabad'] },
  { code: 'GB', name: 'Gilgit-Baltistan', districts: ['Gilgit', 'Skardu'] },
  { code: 'AJK', name: 'Azad Jammu & Kashmir', districts: ['Muzaffarabad', 'Mirpur'] },
];

/** `rank` orders levels so a requirement can be compared with a candidate's highest level. */
export const qualificationLevels = [
  { code: 'matric', name: 'Matric / SSC', rank: 1 },
  { code: 'intermediate', name: 'Intermediate / HSSC', rank: 2 },
  { code: 'dae', name: 'Diploma of Associate Engineer (DAE)', rank: 2 },
  { code: 'bachelor14', name: "Bachelor's (14 years)", rank: 3 },
  { code: 'bachelor16', name: "Bachelor's (16 years) / BE / BS", rank: 4 },
  { code: 'master', name: "Master's", rank: 5 },
  { code: 'mphil', name: 'MPhil / MS', rank: 6 },
  { code: 'phd', name: 'PhD', rank: 7 },
];

export const documentTypes = [
  { code: 'cnic_copy', name: 'CNIC copy (both sides)' },
  { code: 'photo', name: 'Passport-size photograph' },
  { code: 'domicile_certificate', name: 'Domicile certificate' },
  { code: 'matric_certificate', name: 'Matric certificate' },
  { code: 'intermediate_certificate', name: 'Intermediate certificate' },
  { code: 'degree', name: 'Degree / transcript' },
  { code: 'dae_certificate', name: 'DAE certificate' },
  { code: 'experience_certificate', name: 'Experience certificate' },
  { code: 'character_certificate', name: 'Character certificate' },
  { code: 'pec_registration', name: 'PEC registration' },
  { code: 'noc', name: 'No-objection certificate (NOC)' },
  { code: 'disability_certificate', name: 'Disability certificate' },
];

export const employmentTypes = [
  { code: 'permanent', name: 'Permanent' },
  { code: 'contract', name: 'Contract' },
];

export const bpsRanges = [
  { code: '1-4', name: 'BPS 1–4', min: 1, max: 4 },
  { code: '5-10', name: 'BPS 5–10', min: 5, max: 10 },
  { code: '11-14', name: 'BPS 11–14', min: 11, max: 14 },
  { code: '15-16', name: 'BPS 15–16', min: 15, max: 16 },
  { code: '17-22', name: 'BPS 17 and above', min: 17, max: 22 },
];

export const genders = [
  { code: 'male', name: 'Male' },
  { code: 'female', name: 'Female' },
  { code: 'transgender', name: 'Transgender' },
];
