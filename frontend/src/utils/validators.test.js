import { isValidCnic, isValidEmail, isValidMobile, isValidOtp } from './validators';

describe('validators', () => {
  it('accepts a dashed 13-digit CNIC only', () => {
    expect(isValidCnic('12345-1234567-1')).toBe(true);
    expect(isValidCnic('1234512345671')).toBe(false);
    expect(isValidCnic('12345-123456-1')).toBe(false);
  });

  it('accepts Pakistani mobile numbers with or without a dash', () => {
    expect(isValidMobile('03001234567')).toBe(true);
    expect(isValidMobile('0300-1234567')).toBe(true);
    expect(isValidMobile('3001234567')).toBe(false);
    expect(isValidMobile('0300-123456')).toBe(false);
  });

  it('requires exactly six OTP digits', () => {
    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('12345')).toBe(false);
    expect(isValidOtp('12a456')).toBe(false);
  });

  it('checks email shape', () => {
    expect(isValidEmail('name@example.com')).toBe(true);
    expect(isValidEmail('name@example')).toBe(false);
  });
});
