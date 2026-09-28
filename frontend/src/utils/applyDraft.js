// Apply wizard progress, kept per candidate and job so a reload, a dropped connection or an
// expired login resumes where the candidate left off. sessionStorage: it ends with the tab (like
// the login token) and is cleared on submit and logout, so a shared computer doesn't keep it.

const PREFIX = 'pr-apply-draft:';

// The backend accepts an apply pass for 30 minutes; stop reusing it a minute early.
export const PASS_LIFETIME_MS = 29 * 60 * 1000;

// Steps a draft can resume at. The SMS code step goes back to identity (the code is gone).
const RESUMABLE = ['identity', 'profile', 'documents', 'review'];

/** { step, applyPass, passAt, form, afterOtp } or null. Expired passes are dropped. */
export function loadApplyDraft(key, now = Date.now()) {
  if (!key) return null;
  let draft;
  try {
    draft = JSON.parse(sessionStorage.getItem(PREFIX + key));
  } catch {
    return null;
  }
  if (!draft || typeof draft !== 'object') return null;
  const passValid = Boolean(draft.applyPass) && now - (draft.passAt ?? 0) < PASS_LIFETIME_MS;
  return {
    step: RESUMABLE.includes(draft.step) ? draft.step : 'identity',
    applyPass: passValid ? draft.applyPass : null,
    passAt: passValid ? draft.passAt : null,
    form: draft.form ?? null,
    afterOtp: RESUMABLE.includes(draft.afterOtp) ? draft.afterOtp : null,
  };
}

export function saveApplyDraft(key, draft) {
  if (!key) return;
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(draft));
  } catch {
    // Storage blocked or full: the wizard still works, it just won't resume.
  }
}

export function clearApplyDraft(key) {
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    // Nothing to clear.
  }
}

/** On logout: forget every draft in this tab. */
export function clearApplyDrafts() {
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Nothing to clear.
  }
}
