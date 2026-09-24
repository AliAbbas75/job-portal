/** Profile sections in display order. `isComplete` drives the ticks and the progress bar. */
export const SECTIONS = [
  {
    id: 'personal',
    required: true,
    isComplete: (p) =>
      Boolean(p.personal.fullName && p.personal.fatherName && p.personal.dob && p.personal.gender),
  },
  {
    id: 'contact',
    required: true,
    isComplete: (p) => Boolean(p.contact.currentAddress && p.contact.permanentAddress),
  },
  {
    id: 'domicile',
    required: true,
    isComplete: (p) => Boolean(p.domicile.province && p.domicile.district),
  },
  { id: 'education', required: true, isComplete: (p) => p.education.length > 0 },
  { id: 'experience', required: false, isComplete: (p) => p.experience.length > 0 },
  { id: 'skills', required: false, isComplete: (p) => p.skills.length > 0 },
  {
    id: 'documents',
    required: true,
    isComplete: (_p, docs) =>
      ['cnic_copy', 'photo'].every((type) => docs.some((d) => d.type === type)),
  },
  { id: 'additional', required: false, isComplete: () => true },
];

export function completion(profile, documents) {
  const required = SECTIONS.filter((s) => s.required);
  const done = required.filter((s) => s.isComplete(profile, documents)).length;
  return (done / required.length) * 100;
}
