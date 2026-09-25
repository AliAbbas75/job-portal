/** Short public job reference shown in tables, e.g. JD-0101 (from the job id). */
export function jobCode(job) {
  const digits = String(job.id).replace(/\D/g, '');
  return `JD-${digits.padStart(4, '0')}`;
}
