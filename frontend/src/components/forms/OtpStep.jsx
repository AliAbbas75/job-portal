import { useEffect, useState } from 'react';
import { USE_MOCKS } from '../../api/client';
import { t } from '../../i18n';
import { errorMessage } from '../../utils/errorMessage';
import { isValidOtp } from '../../utils/validators';
import { Alert } from '../common/Alert';
import { Button } from '../common/Button';
import { TextField } from './TextField';

const RESEND_SECONDS = 60;

/** Second step of sign-up/login: enter the 6-digit code sent by SMS. */
export function OtpStep({ mobile, onVerify, onResend, onBack }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function submit(event) {
    event.preventDefault();
    if (!isValidOtp(otp)) {
      setError(t('validation.otp'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onVerify(otp);
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

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <p>{t('otp.sentTo', { mobile })}</p>
      {USE_MOCKS && <Alert variant="info">{t('otp.demoHint')}</Alert>}
      <TextField
        label={t('otp.label')}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={otp}
        onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
        error={error}
        required
        autoFocus
      />
      <Button type="submit" size="lg" fullWidth loading={busy}>
        {t('otp.verify')}
      </Button>
      <p>
        {secondsLeft > 0 ? (
          t('otp.resendIn', { count: secondsLeft })
        ) : (
          <Button variant="ghost" size="sm" onClick={resend}>
            {t('otp.resend')}
          </Button>
        )}{' '}
        ·{' '}
        <Button variant="ghost" size="sm" onClick={onBack}>
          {t('otp.changeNumber')}
        </Button>
      </p>
    </form>
  );
}
