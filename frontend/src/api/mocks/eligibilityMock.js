// Stand-in for the backend eligibility engine (T-060). Mock mode only.
import { provinces, qualificationLevels } from './referenceData';

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
const rankOf = (code) => qualificationLevels.find((l) => l.code === code)?.rank ?? 0;

export function ageOn(dob, date) {
  const birth = new Date(dob);
  const on = new Date(date);
  let age = on.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    on.getMonth() < birth.getMonth() ||
    (on.getMonth() === birth.getMonth() && on.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function experienceYears(entries) {
  const ms = entries.reduce((sum, e) => {
    const end = e.current || !e.endDate ? new Date() : new Date(e.endDate);
    return sum + Math.max(0, end - new Date(e.startDate));
  }, 0);
  return Math.floor((ms / YEAR_MS) * 10) / 10;
}

function educationItem(req, education, highestLevel) {
  const required = { level: req.minQualification, marks: req.minMarksPercent };
  if (education.length === 0) {
    // Same rule as the backend: the one-page profile's highest level counts, but minimum
    // marks need the full education record.
    if (!highestLevel) return { key: 'education', status: 'missing', required, fix: 'education' };
    if (rankOf(highestLevel) < rankOf(req.minQualification)) {
      return { key: 'education', status: 'not_met', required };
    }
    if (req.minMarksPercent)
      return { key: 'education', status: 'missing', required, fix: 'education' };
    return { key: 'education', status: 'met', required };
  }
  const qualifying = education.filter((e) => rankOf(e.level) >= rankOf(req.minQualification));
  if (qualifying.length === 0) return { key: 'education', status: 'not_met', required };
  if (
    req.minMarksPercent &&
    qualifying.every((e) => Number(e.marksPercent) < req.minMarksPercent)
  ) {
    return { key: 'education', status: 'not_met', required, reason: 'marks' };
  }
  return { key: 'education', status: 'met', required };
}

function experienceItem(req, experience) {
  const required = { years: req.experienceYears };
  const actual = experienceYears(experience);
  const status = actual >= req.experienceYears ? 'met' : 'missing';
  return {
    key: 'experience',
    status,
    required,
    actual,
    fix: status === 'missing' ? 'experience' : undefined,
  };
}

function ageItem(req, dob, closingDate) {
  const required = { min: req.ageMin, max: req.ageMax };
  if (!dob) return { key: 'age', status: 'missing', required, fix: 'personal' };
  const actual = ageOn(dob, closingDate);
  const status = actual >= req.ageMin && actual <= req.ageMax ? 'met' : 'not_met';
  return { key: 'age', status, required, actual };
}

function domicileItem(req, domicile) {
  const required = {
    provinces: req.domicileProvinces.map(
      (code) => provinces.find((p) => p.code === code)?.name ?? code,
    ),
  };
  if (!domicile.province) return { key: 'domicile', status: 'missing', required, fix: 'domicile' };
  const status = req.domicileProvinces.includes(domicile.province) ? 'met' : 'not_met';
  return { key: 'domicile', status, required };
}

/** Compares a job's structured requirements with a profile and the document vault. */
export function checkEligibility(job, profile, documents) {
  const req = job.requirements;
  const items = [educationItem(req, profile.education, profile.claims?.highestQualification)];
  if (req.experienceYears > 0) items.push(experienceItem(req, profile.experience));
  items.push(ageItem(req, profile.personal.dob, job.closingDate));
  if (req.domicileProvinces.length > 0) items.push(domicileItem(req, profile.domicile));
  for (const type of req.documents) {
    const doc = documents.find((d) => d.type === type);
    items.push({
      key: 'document',
      documentType: type,
      status: doc ? 'met' : 'missing',
      documentId: doc?.id,
    });
  }
  return {
    items,
    eligible: items.every((i) => i.status !== 'not_met'),
    complete: items.every((i) => i.status === 'met'),
  };
}
