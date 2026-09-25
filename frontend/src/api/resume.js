import { client, USE_MOCKS } from './client';
import * as mock from './mocks/resumeMock';

/**
 * BPS-15+ tier (M5). Uploads a PDF or Word resume and returns suggested profile values; nothing is
 * saved to the profile until the candidate confirms a section (save it with the functions in
 * api/profile.js). Shape:
 * {
 *   documentId, parsed,          // parsed false: nothing readable (e.g. a scan) → open the builder
 *   lowConfidence: 0.6,          // highlight values with confidence below this
 *   sections: {
 *     personal: { fullName?, fatherName?, dob? },            // each { value, confidence }
 *     contact: { email?, currentAddress? },                  // each { value, confidence }
 *     statementOfPurpose?: { value, confidence },
 *     education: [{ level, discipline, institution, year, marksPercent, confidence }],
 *     experience: [{ designation, organization, startDate, endDate, current, confidence }],
 *     skills: [string],
 *     registrations: [{ body, registrationNo, confidence }],
 *     publications: [{ title, year, confidence }],
 *     references: [{ name, designation, organization, email, phone, confidence }],
 *   }
 * }
 */
export async function uploadResume(file) {
  if (USE_MOCKS) return mock.uploadResume(file);
  const form = new FormData();
  form.append('file', file);
  const { data } = await client.post('/resume', form);
  return data;
}

/** The profile as a formatted resume PDF (Blob), for the builder's "Download PDF". */
export async function downloadResumePdf() {
  if (USE_MOCKS) return mock.downloadResumePdf();
  const { data } = await client.get('/resume/pdf', { responseType: 'blob' });
  return data;
}
