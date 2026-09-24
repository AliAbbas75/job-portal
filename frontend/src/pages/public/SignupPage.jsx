import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../../api/auth';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { CheckboxField } from '../../components/forms/CheckboxField';
import { CnicInput } from '../../components/forms/CnicInput';
import { OtpStep } from '../../components/forms/OtpStep';
import { TextField } from '../../components/forms/TextField';
import { AuthCard } from '../../components/layout/AuthCard';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { errorMessage } from '../../utils/errorMessage';
import { safeNext } from '../../utils/safeNext';
import { isValidCnic, isValidMobile } from '../../utils/validators';

export default function SignupPage() {
  useDocumentTitle(t('signup.title'));
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'), paths.profile);

  const [step, setStep] = useState('details');
  const [cnic, setCnic] = useState('');
  const [mobile, setMobile] = useState('');
  // Placeholder until the real CAPTCHA widget is integrated (T-020).
  const [notRobot, setNotRobot] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function sendOtp(event) {
    event.preventDefault();
    const found = {};
    if (!isValidCnic(cnic)) found.cnic = t('validation.cnic');
    if (!isValidMobile(mobile)) found.mobile = t('validation.mobile');
    if (!notRobot) found.captcha = t('validation.captcha');
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setFormError(null);
    try {
      await requestOtp({ purpose: 'signup', cnic, mobile });
      setStep('otp');
    } catch (err) {
      setFormError(err);
    } finally {
      setBusy(false);
    }
  }

  async function verify(otp) {
    const session = await verifyOtp({ purpose: 'signup', cnic, mobile, otp });
    signIn(session);
    navigate(next, { replace: true });
  }

  const loginLink = (
    <p>
      {t('signup.haveAccount')}{' '}
      <Link to={`${paths.login}${searchParams.toString() ? `?${searchParams}` : ''}`}>
        {t('nav.logIn')}
      </Link>
    </p>
  );

  if (step === 'otp') {
    return (
      <AuthCard title={t('otp.title')} footer={loginLink}>
        <OtpStep
          mobile={mobile}
          onVerify={verify}
          onResend={() => requestOtp({ purpose: 'signup', cnic, mobile })}
          onBack={() => setStep('details')}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('signup.title')} lead={t('signup.lead')} footer={loginLink}>
      <form className="stack" onSubmit={sendOtp} noValidate>
        {formError && (
          <Alert
            variant="error"
            action={
              formError.code === 'cnic_taken' && (
                <Button to={paths.login} variant="secondary" size="sm">
                  {t('nav.logIn')}
                </Button>
              )
            }
          >
            {errorMessage(formError)}
          </Alert>
        )}
        <CnicInput value={cnic} onChange={setCnic} error={errors.cnic} required />
        <TextField
          label={t('fields.mobile')}
          hint={t('fields.mobileHint')}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="03XX-XXXXXXX"
          value={mobile}
          onChange={(event) => setMobile(event.target.value.trim())}
          error={errors.mobile}
          required
        />
        <CheckboxField
          label={t('signup.captcha')}
          description={t('signup.captchaNote')}
          checked={notRobot}
          onChange={(event) => setNotRobot(event.target.checked)}
          error={errors.captcha}
        />
        <Button type="submit" size="lg" fullWidth loading={busy}>
          {t('signup.submit')}
        </Button>
        <p>{t('signup.permanentNote')}</p>
      </form>
    </AuthCard>
  );
}
