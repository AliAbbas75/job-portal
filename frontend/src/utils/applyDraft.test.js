import {
  clearApplyDraft,
  clearApplyDrafts,
  loadApplyDraft,
  PASS_LIFETIME_MS,
  saveApplyDraft,
} from './applyDraft';

const NOW = 1_800_000_000_000;

describe('applyDraft', () => {
  beforeEach(() => sessionStorage.clear());

  it('resumes the saved step with a pass that is still valid', () => {
    saveApplyDraft('c1:j1', { step: 'documents', applyPass: 'p', passAt: NOW - 60_000, form: {} });
    expect(loadApplyDraft('c1:j1', NOW)).toMatchObject({ step: 'documents', applyPass: 'p' });
  });

  it('drops an expired pass but keeps the step', () => {
    saveApplyDraft('c1:j1', { step: 'review', applyPass: 'p', passAt: NOW - PASS_LIFETIME_MS });
    expect(loadApplyDraft('c1:j1', NOW)).toMatchObject({ step: 'review', applyPass: null });
  });

  it('sends the SMS code step back to identity', () => {
    saveApplyDraft('c1:j1', { step: 'otp' });
    expect(loadApplyDraft('c1:j1', NOW).step).toBe('identity');
  });

  it('keeps drafts apart per candidate and job, and clears them', () => {
    saveApplyDraft('c1:j1', { step: 'profile' });
    saveApplyDraft('c1:j2', { step: 'review' });
    expect(loadApplyDraft('c2:j1')).toBeNull();

    clearApplyDraft('c1:j1');
    expect(loadApplyDraft('c1:j1')).toBeNull();
    clearApplyDrafts();
    expect(loadApplyDraft('c1:j2')).toBeNull();
  });

  it('ignores a missing key or unreadable data', () => {
    expect(loadApplyDraft(null)).toBeNull();
    sessionStorage.setItem('pr-apply-draft:c1:j1', '{not json');
    expect(loadApplyDraft('c1:j1')).toBeNull();
  });
});
