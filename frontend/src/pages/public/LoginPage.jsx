import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../../api/auth';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { Captcha } from '../../components/forms/Captcha';
import { IconField } from '../../components/forms/IconField';
import { OperatorField } from '../../components/forms/OperatorField';
import { OtpStep } from '../../components/forms/OtpStep';
import { AuthCard } from '../../components/layout/AuthCard';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { errorMessage } from '../../utils/errorMessage';
import { formatCnic } from '../../utils/format';
import { safeNext } from '../../utils/safeNext';
import { isValidCnic, isValidMobile } from '../../utils/validators';

/** "Login to Your Account": CNIC + registered mobile, a new SMS code every time. */
export default function LoginPage() {
  useDocumentTitle(t('auth.loginTitle'));
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'), paths.applications);

  const [step, setStep] = useState('details');
  const [cnic, setCnic] = useState('');
  const [operator, setOperator] = useState('');
  const [mobile, setMobile] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const ready = isValidCnic(cnic) && operator && isValidMobile(mobile) && captcha;

  async function sendOtp(event) {
    event.preventDefault();
    const found = {};
    if (!isValidCnic(cnic)) found.cnic = t('validation.cnic');
    if (!operator) found.operator = t('validation.operator');
    if (!isValidMobile(mobile)) found.mobile = t('validation.mobile');
    if (!captcha) found.captcha = t('validation.captcha');
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setFormError(null);
    try {
      await requestOtp({ purpose: 'login', cnic, mobile, operator, captchaToken: captcha });
      setStep('otp');
    } catch (err) {
      setFormError(err);
    } finally {
      setBusy(false);
    }
  }

  async function verify(otp) {
    const session = await verifyOtp({ purpose: 'login', cnic, mobile, otp, operator, remember });
    signIn(session, { remember });
    navigate(next, { replace: true });
  }

  const signupLink = (
    <span>
      {t('auth.noAccount')}{' '}
      <Link
        to={`${paths.signup}${searchParams.toString() ? `?${searchParams}` : ''}`}
        className="font-bold"
      >
        {t('auth.createAccount')}
      </Link>
    </span>
  );

  if (step === 'otp') {
    return (
      <AuthCard footer={signupLink}>
        <OtpStep
          mobile={mobile}
          onVerify={verify}
          onResend={() =>
            requestOtp({ purpose: 'login', cnic, mobile, operator, captchaToken: captcha })
          }
          onBack={() => setStep('details')}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('auth.loginTitle')} lead={t('auth.loginLead')} footer={signupLink}>
      <form className="space-y-4" onSubmit={sendOtp} noValidate>
        {formError && <Alert variant="error">{errorMessage(formError)}</Alert>}
        <IconField
          label={t('auth.cnic')}
          icon="idCard"
          placeholder={t('auth.cnicPlaceholder')}
          inputMode="numeric"
          value={cnic}
          onChange={(event) => setCnic(formatCnic(event.target.value))}
          error={errors.cnic}
          required
        />
        <OperatorField value={operator} onChange={setOperator} error={errors.operator} />
        <IconField
          label={t('auth.mobile')}
          icon="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t('auth.mobilePlaceholder')}
          value={mobile}
          onChange={(event) => setMobile(event.target.value.trim())}
          error={errors.mobile}
          required
        />
        <Captcha value={captcha} onChange={setCaptcha} error={errors.captcha} />
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="size-4 accent-heritage"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          {t('auth.remember')}
        </label>
        <Button type="submit" size="lg" fullWidth disabled={!ready} loading={busy}>
          {t('auth.loginSubmit')}
        </Button>
      </form>
    </AuthCard>
  );
}
