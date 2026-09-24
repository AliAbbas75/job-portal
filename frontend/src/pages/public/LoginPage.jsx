import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../../api/auth';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
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

export default function LoginPage() {
  useDocumentTitle(t('login.title'));
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'), paths.applications);

  const [step, setStep] = useState('details');
  const [cnic, setCnic] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function sendOtp(event) {
    event.preventDefault();
    const found = {};
    if (!isValidCnic(cnic)) found.cnic = t('validation.cnic');
    if (!isValidMobile(mobile)) found.mobile = t('validation.mobile');
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setFormError(null);
    try {
      await requestOtp({ purpose: 'login', cnic, mobile });
      setStep('otp');
    } catch (err) {
      setFormError(err);
    } finally {
      setBusy(false);
    }
  }

  async function verify(otp) {
    const session = await verifyOtp({ purpose: 'login', cnic, mobile, otp });
    signIn(session);
    navigate(next, { replace: true });
  }

  const signupLink = (
    <p>
      {t('login.noAccount')}{' '}
      <Link to={`${paths.signup}${searchParams.toString() ? `?${searchParams}` : ''}`}>
        {t('nav.createAccount')}
      </Link>
    </p>
  );

  if (step === 'otp') {
    return (
      <AuthCard title={t('otp.title')} footer={signupLink}>
        <OtpStep
          mobile={mobile}
          onVerify={verify}
          onResend={() => requestOtp({ purpose: 'login', cnic, mobile })}
          onBack={() => setStep('details')}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('login.title')} lead={t('login.lead')} footer={signupLink}>
      <form className="stack" onSubmit={sendOtp} noValidate>
        {formError && <Alert variant="error">{errorMessage(formError)}</Alert>}
        <CnicInput value={cnic} onChange={setCnic} error={errors.cnic} required />
        <TextField
          label={t('fields.mobile')}
          hint={t('login.mobileHint')}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="03XX-XXXXXXX"
          value={mobile}
          onChange={(event) => setMobile(event.target.value.trim())}
          error={errors.mobile}
          required
        />
        <Button type="submit" size="lg" fullWidth loading={busy}>
          {t('login.submit')}
        </Button>
      </form>
    </AuthCard>
  );
}
