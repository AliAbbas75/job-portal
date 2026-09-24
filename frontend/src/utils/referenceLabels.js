/** Display names for reference-data codes. `ref` is the result of useReferenceData(). */
const nameIn = (list, code) => list?.find((item) => item.code === code)?.name ?? code;

export const qualificationName = (ref, code) => nameIn(ref?.qualificationLevels, code);
export const documentName = (ref, code) => nameIn(ref?.documentTypes, code);
export const provinceName = (ref, code) => nameIn(ref?.provinces, code);
export const genderName = (ref, code) => nameIn(ref?.genders, code);
