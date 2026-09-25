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

/** "Create Your Account" → "Check Your Mobile" → "Success!" (design: Malaika / Figma). */
export default function SignupPage() {
  useDocumentTitle(t('auth.signupTitle'));
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'), paths.profile);

  const [step, setStep] = useState('details');
  const [cnic, setCnic] = useState('');
  const [operator, setOperator] = useState('');
  const [mobile, setMobile] = useState('');
  const [captcha, setCaptcha] = useState(null);
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
      await requestOtp({ purpose: 'signup', cnic, mobile, operator, captchaToken: captcha });
      setStep('otp');
    } catch (err) {
      setFormError(err);
    } finally {
      setBusy(false);
    }
  }

  async function verify(otp) {
    signIn(await verifyOtp({ purpose: 'signup', cnic, mobile, otp, operator }));
  }

  const loginLink = (
    <span>
      {t('auth.haveAccount')}{' '}
      <Link
        to={`${paths.login}${searchParams.toString() ? `?${searchParams}` : ''}`}
        className="font-bold"
      >
        {t('auth.login')}
      </Link>
    </span>
  );

  if (step === 'otp') {
    return (
      <AuthCard footer={loginLink}>
        <OtpStep
          mobile={mobile}
          onVerify={verify}
          onResend={() =>
            requestOtp({ purpose: 'signup', cnic, mobile, operator, captchaToken: captcha })
          }
          onBack={() => setStep('details')}
          onContinue={() => navigate(next, { replace: true })}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('auth.signupTitle')} lead={t('auth.signupLead')} footer={loginLink}>
      <form className="space-y-4" onSubmit={sendOtp} noValidate>
        {formError && (
          <Alert
            variant="error"
            action={
              formError.code === 'cnic_taken' && (
                <Button to={paths.login} variant="secondary" size="sm">
                  {t('auth.login')}
                </Button>
              )
            }
          >
            {errorMessage(formError)}
          </Alert>
        )}
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
        <Button type="submit" size="lg" fullWidth disabled={!ready} loading={busy}>
          {t('auth.signupSubmit')}
        </Button>
      </form>
    </AuthCard>
  );
}
