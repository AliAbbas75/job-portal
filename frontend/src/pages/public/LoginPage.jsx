import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../../api/auth';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { Captcha } from '../../components/forms/Captcha';
import { OperatorField } from '../../components/forms/OperatorField';
import { OtpStep } from '../../components/forms/OtpStep';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { errorMessage } from '../../utils/errorMessage';
import { formatCnic } from '../../utils/format';
import { safeNext } from '../../utils/safeNext';
import { isValidCnic, isValidMobile } from '../../utils/validators';

/**
 * Redesigned Pakistan Railways Candidate Login Page:
 * - 50% Left Screen: Clean white background with brand headline and value proposition
 * - 50% Right Screen: Scenic Pakistan Railways train background
 * - White modal card floating on the right half containing the login form
 */
export default function LoginPage() {
  useDocumentTitle(t('auth.loginTitle'));
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionEnded = useLocation().state?.sessionEnded;
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
  const [showForgotModal, setShowForgotModal] = useState(false);

  async function sendOtp(event) {
    if (event) event.preventDefault();
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

  return (
    <div className="relative flex min-h-[500px] flex-1 w-full items-center justify-between overflow-hidden bg-white">
      {/* Scenic Train Background Layer: extends to left-center with a soft gradient fade */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[74%] md:w-[70%] lg:w-[67%] xl:w-[64%] bg-cover bg-[position:22%_center] lg:bg-[position:16%_center]"
        style={{ backgroundImage: `url('/login-train-bg.jpg')` }}
        aria-hidden="true"
      >
        {/* Soft linear fade on the left blending solid white into misty mountains & tracks */}
        <div
          className="absolute inset-y-0 left-0 w-28 sm:w-44 md:w-56 lg:w-72 bg-gradient-to-r from-white via-white/80 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Main Container: Exact page container width (aligning from Logo on left to last item on right) with proper distance from navbar */}
      <div className="page relative z-10 flex w-full flex-col items-center justify-between gap-8 py-8 sm:py-10 lg:flex-row lg:gap-10 lg:py-12">
        {/* LEFT SIDE: Brand headline & candidate value proposition */}
        <div className="flex w-full flex-col justify-center lg:w-[50%] xl:w-[48%]">
          <div className="flex flex-col space-y-4 lg:space-y-5">
            {/* Eyebrow Header */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span className="text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest text-heritage uppercase">
                PAKISTAN RAILWAYS
              </span>
              <span className="inline-block h-[1.5px] w-5 sm:w-7 bg-heritage" />
              <span className="text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest text-heritage uppercase">
                PUBLIC RECRUITMENT SERVICES
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-bold tracking-tight text-heritage leading-tight sm:leading-[1.12]">
              Your next <br className="hidden sm:inline" />
              opportunity <br className="hidden sm:inline" />
              starts here.
            </h1>

            {/* Subtitle */}
            <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-black/80">
              Join Pakistan Railways and be a part of a legacy of progress, service and nation
              building.
            </p>

            {/* Candidate Feature Pill / Badge */}
            <div className="flex max-w-sm items-center gap-3 rounded-xl border border-heritage/20 bg-surface/90 p-3">
              <div className="flex-none rounded-lg bg-white p-2.5 text-heritage border border-heritage/20">
                <Icon name="idBadge" size={22} />
              </div>
              <p className="text-xs font-medium leading-snug text-black">
                Access your candidate profile, applications and job updates.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: White Modal Card Floating Over The Scenic Train Image */}
        <div className="flex w-full justify-center lg:w-[46%] lg:justify-end">
          <div className="relative z-10 w-full max-w-[390px] xl:max-w-[410px] rounded-2xl border border-heritage/20 bg-white p-5 sm:p-6 shadow-sm">
            {step === 'otp' ? (
              /* OTP Verification Step */
              <div>
                <OtpStep
                  mobile={mobile}
                  onVerify={verify}
                  onResend={() =>
                    requestOtp({ purpose: 'login', cnic, mobile, operator, captchaToken: captcha })
                  }
                  onBack={() => setStep('details')}
                />
                <div className="relative my-4 flex items-center justify-center">
                  <div className="w-full border-t border-heritage/20" />
                  <span className="absolute bg-white px-2.5 text-[10px] font-semibold uppercase text-black/40">
                    OR
                  </span>
                </div>
                <p className="text-center text-xs text-black/70">
                  {t('auth.noAccount')}{' '}
                  <Link to={paths.signup} className="font-bold text-heritage hover:underline">
                    {t('auth.createAccount')}
                  </Link>
                </p>
              </div>
            ) : (
              /* Step 1: Login Details Form */
              <div>
                <div className="mb-3.5">
                  <h2 className="text-2xl font-bold tracking-tight text-heritage">
                    {t('auth.welcomeBack')}
                  </h2>
                  <p className="mt-0.5 text-xs text-black/60">
                    {t('auth.loginSubtitle')}
                  </p>
                </div>

                <form className="space-y-2.5" onSubmit={sendOtp} noValidate>
                  {sessionEnded && !formError && (
                    <Alert variant="info" title={t('auth.sessionEndedTitle')}>
                      {t('auth.sessionEnded')}
                    </Alert>
                  )}
                  {formError && <Alert variant="error">{errorMessage(formError)}</Alert>}

                  {/* 1. Enter CNIC * with ID Card Icon */}
                  <div>
                    <label
                      htmlFor="cnic-input"
                      className="mb-1 block text-[11px] font-semibold text-black"
                    >
                      {t('auth.enterCnic')} <span className="text-ember">*</span>
                    </label>
                    <div className="relative flex h-9 items-center rounded-md border border-heritage/30 bg-white px-3 transition-all focus-within:border-heritage focus-within:ring-1 focus-within:ring-heritage">
                      <Icon name="idCard" size={16} className="mr-2 flex-none text-heritage/60" />
                      <input
                        id="cnic-input"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder={t('auth.enterCnicPlaceholder')}
                        value={cnic}
                        onChange={(event) => setCnic(formatCnic(event.target.value))}
                        className="w-full bg-transparent text-xs text-black placeholder:text-black/40 focus:outline-none"
                        required
                        aria-invalid={Boolean(errors.cnic) || undefined}
                      />
                    </div>
                    {errors.cnic && (
                      <p className="mt-0.5 text-xs font-medium text-ember">{errors.cnic}</p>
                    )}
                  </div>

                  {/* 2. Select Telecom Operator * with Signal Icon */}
                  <div>
                    <OperatorField
                      value={operator}
                      onChange={(val) => {
                        setOperator(val);
                        if (errors.operator) setErrors((prev) => ({ ...prev, operator: null }));
                      }}
                      error={errors.operator}
                      compact
                      leadingIcon="signal"
                    />
                  </div>

                  {/* 3. Mobile Number * with Phone Icon */}
                  <div>
                    <label
                      htmlFor="mobile-input"
                      className="mb-1 block text-[11px] font-semibold text-black"
                    >
                      {t('auth.mobileNumber')} <span className="text-ember">*</span>
                    </label>
                    <div className="relative flex h-9 items-center rounded-md border border-heritage/30 bg-white px-3 transition-all focus-within:border-heritage focus-within:ring-1 focus-within:ring-heritage">
                      <Icon name="phone" size={16} className="mr-2 flex-none text-heritage/60" />
                      <input
                        id="mobile-input"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder={t('auth.mobilePlaceholder')}
                        value={mobile}
                        onChange={(event) => {
                          setMobile(event.target.value.trim());
                          if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: null }));
                        }}
                        className="w-full bg-transparent text-xs text-black placeholder:text-black/40 focus:outline-none"
                        required
                        aria-invalid={Boolean(errors.mobile) || undefined}
                      />
                    </div>
                    {errors.mobile && (
                      <p className="mt-0.5 text-xs font-medium text-ember">{errors.mobile}</p>
                    )}
                  </div>

                  {/* 4. reCAPTCHA Box */}
                  <div>
                    <Captcha
                      value={captcha}
                      onChange={(val) => {
                        setCaptcha(val);
                        if (errors.captcha) setErrors((prev) => ({ ...prev, captcha: null }));
                      }}
                      error={errors.captcha}
                    />
                  </div>

                  {/* 5. Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between pt-0.5 text-xs">
                    <label className="flex cursor-pointer items-center gap-1.5 select-none text-black/80">
                      <input
                        type="checkbox"
                        className="size-3.5 rounded accent-heritage"
                        checked={remember}
                        onChange={(event) => setRemember(event.target.checked)}
                      />
                      <span>{t('auth.remember')}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="cursor-pointer font-medium text-heritage hover:underline"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>

                  {/* 6. Login Button with Arrow */}
                  <Button
                    type="submit"
                    size="sm"
                    fullWidth
                    loading={busy}
                    className="mt-1 flex h-9.5 items-center justify-center gap-1.5 rounded-md bg-heritage text-xs sm:text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <span>{t('auth.loginSubmit')}</span>
                    {!busy && <span aria-hidden="true">&rarr;</span>}
                  </Button>

                  {/* 7. OR Divider */}
                  <div className="relative my-2 flex items-center justify-center">
                    <div className="w-full border-t border-heritage/20" />
                    <span className="absolute bg-white px-2.5 text-[10px] font-semibold uppercase text-black/40">
                      OR
                    </span>
                  </div>

                  {/* 8. Create Account Link */}
                  <p className="text-center text-xs text-black/70">
                    {t('auth.noAccount')}{' '}
                    <Link
                      to={`${paths.signup}${searchParams.toString() ? `?${searchParams}` : ''}`}
                      className="font-bold text-heritage hover:underline"
                    >
                      {t('auth.createAccount')}
                    </Link>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password / Account Access Info Modal */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-heritage/20">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-heritage">Account Access & OTP</h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="cursor-pointer rounded-full p-1 text-black/50 hover:bg-surface hover:text-black"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-black/80">
              Pakistan Railways candidate accounts are password-free and secured with your CNIC and
              registered mobile SMS code (OTP).
            </p>
            <div className="mt-4 rounded-lg bg-surface border border-heritage/20 p-3 text-xs text-heritage">
              <strong>How to access:</strong> Simply enter your registered 13-digit CNIC and mobile
              number on this page to receive a 6-digit verification code.
            </div>
            <div className="mt-4 text-xs text-black/60">
              Need help updating your mobile number? Contact Pakistan Railways Support at{' '}
              <a href="mailto:info@pakrail.gov.pk" className="font-semibold text-heritage underline">
                info@pakrail.gov.pk
              </a>{' '}
              or call <strong>042-99201938</strong>.
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowForgotModal(false)}
                className="rounded-lg"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
