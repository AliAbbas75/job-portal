import { requestOtp, verifyOtp } from './auth';
import { resetDb } from './mocks/store';
import { saveProfileItem, updateProfileSection } from './profile';
import { uploadResume } from './resume';

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

describe('resume API (mock mode)', () => {
  beforeEach(async () => {
    resetDb();
    const identity = { cnic: '00000-1234567-1', mobile: '03001234567' };
    await requestOtp({ purpose: 'signup', operator: 'jazz', ...identity });
    await verifyOtp({ purpose: 'signup', otp: '123456', ...identity });
  });

  it('returns suggested sections for a PDF or Word resume', async () => {
    for (const type of ['application/pdf', DOCX]) {
      const result = await uploadResume(new File(['x'], 'cv', { type }));
      expect(result.parsed).toBe(true);
      expect(result.sections.education[0]).toMatchObject({ level: 'bachelor16' });
      expect(result.lowConfidence).toBe(0.6);
    }
  });

  it('treats a scan as unreadable and refuses images', async () => {
    const scan = await uploadResume(new File(['x'], 'scan.pdf', { type: 'application/pdf' }));
    expect(scan.parsed).toBe(false);
    await expect(
      uploadResume(new File(['x'], 'cv.png', { type: 'image/png' })),
    ).rejects.toMatchObject({
      code: 'file_type_not_allowed',
    });
  });

  it('saves the BPS-15+ sections to the profile', async () => {
    await updateProfileSection('statement', { statementOfPurpose: 'I build railways.' });
    const profile = await saveProfileItem('registrations', {
      body: 'PEC',
      registrationNo: 'CIVIL/1',
    });
    expect(profile.statementOfPurpose).toBe('I build railways.');
    expect(profile.registrations[0]).toMatchObject({ body: 'PEC', registrationNo: 'CIVIL/1' });
  });
});
