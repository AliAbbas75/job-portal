import { client, USE_MOCKS } from './client';
import * as mock from './mocks/referenceData';

/** Lookup lists: departments, provinces (with districts), qualificationLevels, documentTypes, jobCategories, employmentTypes, bpsRanges, genders. */
export async function getReferenceData() {
  if (USE_MOCKS) {
    const {
      departments,
      provinces,
      qualificationLevels,
      documentTypes,
      jobCategories,
      employmentTypes,
      bpsRanges,
      genders,
      quotaClaims,
      ageRelaxations,
      tradeCertificates,
    } = mock;
    return {
      departments,
      provinces,
      qualificationLevels,
      documentTypes,
      jobCategories,
      employmentTypes,
      bpsRanges,
      genders,
      quotaClaims,
      ageRelaxations,
      tradeCertificates,
    };
  }
  const { data } = await client.get('/reference');
  return data;
}
