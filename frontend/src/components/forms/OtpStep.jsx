import { useEffect, useRef, useState } from 'react';
import { USE_MOCKS } from '../../api/client';
import { t } from '../../i18n';
import { errorMessage } from '../../utils/errorMessage';
import { Alert } from '../common/Alert';

const RESEND_SECONDS = 60;

/** Step 2 of candidate login/signup: 6-digit OTP verification & Success screen. */
export function OtpStep({ mobile, onVerify, onResend, onBack }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (!isVerified) {
      inputRefs[0].current?.focus();
    }
  }, [isVerified]);

  useEffect(() => {
    if (secondsLeft <= 0 || isVerified) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, isVerified]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    const char = value.slice(-1);
    next[index] = char;
    setDigits(next);
    setError(null);

    if (char && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    const fullOtp = next.join('');
    if (fullOtp.length === 6) {
      handleVerify(fullOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const next = ['', '', '', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i];
      }
      setDigits(next);
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs[focusIndex].current?.focus();
      if (pasted.length === 6) {
        handleVerify(pasted);
      }
    }
  };

  async function handleVerify(otpCode) {
    setBusy(true);
    setError(null);
    try {
      await onVerify(otpCode);
      setIsVerified(true);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    try {
      await onResend();
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const isComplete = digits.join('').length === 6;

  if (isVerified) {
    return (
      <div className="w-full max-w-md mx-auto text-center font-['Instrument_Sans',sans-serif] py-6">
        <div className="w-20 h-20 mx-auto mb-5 flex items-center justify-center bg-emerald-50 rounded-full border border-emerald-100">
          <svg className="w-12 h-12 text-[#1f4d36]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 8-8M4 7h16M4 12h16" />
          </svg>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2 text-[#1f4d36] font-bold text-xl">
          <span className="w-6 h-6 rounded-full bg-[#1f4d36] text-white flex items-center justify-center text-xs font-bold">✓</span>
          <h2>Success!</h2>
        </div>

        <p className="text-xs md:text-sm text-gray-500 max-w-xs mx-auto mb-8 leading-relaxed">
          Your mobile number <span className="font-semibold text-gray-800">{mobile || '03474082335'}</span> has been registered successfully!
        </p>

        <button
          type="button"
          onClick={() => (window.location.href = '/applications')}
          className="w-full py-3 rounded-lg font-semibold text-sm border border-[#1f4d36] text-[#1f4d36] hover:bg-[#1f4d36] hover:text-white transition-all cursor-pointer shadow-xs"
        >
          Login Now
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto text-center font-['Instrument_Sans',sans-serif]">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Check Your Mobile</h1>
      <p className="text-xs md:text-sm text-gray-500 max-w-xs mx-auto mb-6 leading-relaxed">
        We have sent verification code on your registered number
        <span className="block font-semibold text-gray-800 mt-0.5">{mobile || '03474082335'}</span>
      </p>

      {USE_MOCKS && (
        <div className="mb-4 text-left">
          <Alert variant="info">{t('otp.demoHint')}</Alert>
        </div>
      )}

      {error && (
        <div className="mb-4 text-left">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="flex justify-center gap-2.5 sm:gap-3 mb-6" onPaste={handlePaste}>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={inputRefs[idx]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="w-11 h-12 sm:w-12 sm:h-12 text-center text-xl font-bold rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-[#1f4d36] focus:ring-1 focus:ring-[#1f4d36] focus:outline-none transition-all shadow-xs"
          />
        ))}
      </div>

      <button
        type="button"
        disabled={!isComplete || busy}
        onClick={() => handleVerify(digits.join(''))}
        className={`w-full py-3 rounded-lg font-semibold text-sm transition-all shadow-xs ${
          isComplete && !busy
            ? 'bg-[#1f4d36] hover:bg-[#183e2b] text-white cursor-pointer'
            : 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed'
        }`}
      >
        {busy ? t('jobs.loading') : 'Verify OTP'}
      </button>

      <div className="mt-5 text-xs text-gray-500">
        Didn't receive the code?{' '}
        {secondsLeft > 0 ? (
          <span className="font-semibold text-gray-600">Resend in {secondsLeft}s</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            className="text-[#3b82f6] font-semibold hover:underline bg-none border-none cursor-pointer"
          >
            Click to resend
          </button>
        )}
        {' · '}
        <button
          type="button"
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 bg-none border-none cursor-pointer"
        >
          Change Number
        </button>
      </div>
    </div>
  );
}
