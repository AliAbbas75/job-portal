import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { staffLogin } from '../../api/adminAuth';
import { USE_MOCKS } from '../../api/client';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { TextField } from '../../components/forms/TextField';
import { AuthCard } from '../../components/layout/AuthCard';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { errorMessage } from '../../utils/errorMessage';
import { safeNext } from '../../utils/safeNext';
import { isBlank, isValidEmail } from '../../utils/validators';

export default function StaffLoginPage() {
  useDocumentTitle(t('staffLogin.title'));
  const { status, signIn } = useStaffAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'), paths.admin);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (status === 'authenticated') return <Navigate to={next} replace />;

  async function submit(event) {
    event.preventDefault();
    const found = {};
    if (!isValidEmail(email)) found.email = t('validation.email');
    if (isBlank(password)) found.password = t('validation.required');
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setFormError(null);
    try {
      signIn(await staffLogin({ email, password }));
      navigate(next, { replace: true });
    } catch (err) {
      setFormError(err);
      setBusy(false);
    }
  }

  return (
    <AuthCard title={t('staffLogin.title')} lead={t('staffLogin.lead')}>
      <form className="space-y-4" onSubmit={submit} noValidate>
        {formError && <Alert variant="error">{errorMessage(formError)}</Alert>}
        {USE_MOCKS && <Alert variant="info">{t('staffLogin.demoHint')}</Alert>}
        <TextField
          label={t('staffLogin.email')}
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          required
        />
        <TextField
          label={t('staffLogin.password')}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          required
        />
        <Button type="submit" size="lg" fullWidth loading={busy}>
          {t('staffLogin.submit')}
        </Button>
      </form>
    </AuthCard>
  );
}
