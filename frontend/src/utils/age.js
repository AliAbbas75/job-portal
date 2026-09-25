/** Whole years between a date of birth and `on` (default today). A birthday on `on` counts. */
export function ageOn(dob, on = new Date()) {
  const birth = new Date(dob);
  const at = new Date(on);
  let age = at.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    at.getMonth() < birth.getMonth() ||
    (at.getMonth() === birth.getMonth() && at.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}
