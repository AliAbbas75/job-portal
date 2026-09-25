import { useEffect, useRef, useState } from 'react';
import { USE_MOCKS } from '../../api/client';
import { t } from '../../i18n';
import { cx } from '../../utils/cx';
import { errorMessage } from '../../utils/errorMessage';
import { Alert } from '../common/Alert';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

const RESEND_SECONDS = 60;
const LENGTH = 6;

/**
 * "Check Your Mobile": six code boxes (typing, Backspace, paste and phone autofill all work) that
 * verify as soon as the sixth digit is in. With `onContinue`, a "Success!" screen follows a
 * correct code (signup); otherwise `onVerify` moves on by itself (login). `title` and `lead`
 * replace the default heading (apply wizard).
 */
export function OtpStep({ mobile, onVerify, onResend, onBack, onContinue, title, lead }) {
  const [digits, setDigits] = useState(Array(LENGTH).fill(''));
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const boxes = useRef([]);

  useEffect(() => {
    boxes.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0 || verified) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, verified]);

  async function verify(code) {
    setBusy(true);
    setError(null);
    try {
      await onVerify(code);
      if (onContinue) setVerified(true);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  function fill(index, text) {
    const clean = text.replace(/\D/g, '');
    const next = [...digits];
    if (!clean) {
      next[index] = '';
    } else {
      for (let i = 0; i < clean.length && index + i < LENGTH; i += 1) next[index + i] = clean[i];
      boxes.current[Math.min(index + clean.length, LENGTH - 1)]?.focus();
    }
    setDigits(next);
    setError(null);
    const code = next.join('');
    if (code.length === LENGTH && !busy) verify(code);
  }

  function onKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      boxes.current[index - 1]?.focus();
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

  if (verified) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex size-20 items-center justify-center rounded-full border border-heritage bg-surface text-heritage">
          <Icon name="check" size={40} />
        </span>
        <h2 className="text-xl">{t('auth.successTitle')}</h2>
        <p>{t('auth.successBody', { mobile })}</p>
        <Button variant="secondary" size="lg" fullWidth onClick={onContinue}>
          {t('auth.successNext')}
        </Button>
      </div>
    );
  }

  const complete = digits.join('').length === LENGTH;

  return (
    <div className="flex flex-col gap-5 text-center">
      <div>
        <h1 className="text-2xl">{title ?? t('auth.otpTitle')}</h1>
        <p className="mt-1 text-sm">
          {lead ?? (
            <>
              {t('auth.otpSent')}
              <span className="block font-bold">{mobile}</span>
            </>
          )}
        </p>
      </div>

      {USE_MOCKS && <Alert variant="info">{t('otp.demoHint')}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex justify-center gap-2.5 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (boxes.current[index] = el)}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={LENGTH}
            aria-label={t('auth.otpDigit', { n: index + 1 })}
            value={digit}
            onChange={(event) => fill(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
            className="h-12 w-11 rounded-md border border-heritage bg-white text-center text-xl font-bold sm:w-12"
          />
        ))}
      </div>

      <Button
        size="lg"
        fullWidth
        disabled={!complete}
        loading={busy}
        onClick={() => verify(digits.join(''))}
      >
        {t('auth.otpVerify')}
      </Button>

      <p className="text-sm">
        {t('auth.notReceived')}{' '}
        {secondsLeft > 0 ? (
          <span className="font-bold">{t('auth.resendIn', { count: secondsLeft })}</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            className="cursor-pointer font-bold text-heritage underline"
          >
            {t('auth.resend')}
          </button>
        )}
        {onBack && (
          <>
            {' · '}
            <button
              type="button"
              onClick={onBack}
              className={cx('cursor-pointer underline', busy && 'pointer-events-none')}
            >
              {t('auth.changeNumber')}
            </button>
          </>
        )}
      </p>
    </div>
  );
}
