import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../../api/auth';
import { Alert } from '../../components/common/Alert';
import { OtpStep } from '../../components/forms/OtpStep';
import { AuthCard } from '../../components/layout/AuthCard';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { errorMessage } from '../../utils/errorMessage';
import { safeNext } from '../../utils/safeNext';
import { isValidCnic, isValidMobile } from '../../utils/validators';

const OPERATORS = ['Telenor', 'Jazz', 'Zong', 'Ufone', 'ONIC'];

export default function LoginPage() {
  useDocumentTitle('Login to Your Account');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'), paths.applications);

  const [step, setStep] = useState('details');
  const [cnic, setCnic] = useState('');
  const [operator, setOperator] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const isFormValid =
    cnic.replace(/\D/g, '').length >= 13 &&
    operator &&
    mobile.replace(/\D/g, '').length >= 11 &&
    password.length >= 4 &&
    captchaChecked;

  async function sendOtp(event) {
    event.preventDefault();
    const found = {};
    if (!isValidCnic(cnic)) found.cnic = t('validation.cnic');
    if (!operator) found.operator = 'Please select a telecom operator';
    if (!isValidMobile(mobile)) found.mobile = t('validation.mobile');
    if (!password) found.password = 'Please enter your password';
    if (!captchaChecked) found.captcha = t('validation.captcha');
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setFormError(null);
    try {
      await requestOtp({ purpose: 'login', cnic, mobile, operator, password });
      setStep('otp');
    } catch (err) {
      setFormError(err);
    } finally {
      setBusy(false);
    }
  }

  async function verify(otp) {
    const session = await verifyOtp({ purpose: 'login', cnic, mobile, otp, password });
    signIn(session);
    navigate(next, { replace: true });
  }

  const signupLink = (
    <span>
      Don't have an account ?{' '}
      <Link
        to={`${paths.signup}${searchParams.toString() ? `?${searchParams}` : ''}`}
        className="text-[#3b82f6] font-semibold hover:underline"
      >
        Create Account
      </Link>
    </span>
  );

  if (step === 'otp') {
    return (
      <AuthCard footer={signupLink}>
        <OtpStep
          mobile={mobile}
          onVerify={verify}
          onResend={() => requestOtp({ purpose: 'login', cnic, mobile, operator, password })}
          onBack={() => setStep('details')}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Login to Your Account"
      lead="Enter CNIC, verified mobile number and password for safe access."
      footer={signupLink}
    >
      <form className="space-y-4 text-left font-['Instrument_Sans',sans-serif]" onSubmit={sendOtp} noValidate>
        {formError && <Alert variant="error">{errorMessage(formError)}</Alert>}

        {/* CNIC Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Candidate CNIC <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-gray-200 focus-within:border-[#1f4d36] focus-within:ring-1 focus-within:ring-[#1f4d36] bg-white transition-all">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="2.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 8h2m-2 4h2M6 17c0-2 2-3 3-3s3 1 3 3" />
            </svg>
            <input
              type="text"
              placeholder="Enter 13-digit CNIC"
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              maxLength={15}
            />
          </div>
          {errors.cnic && <p className="text-xs text-red-500 mt-1">{errors.cnic}</p>}
        </div>

        {/* Telecom Operator Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Select Telecom Operator <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-gray-200 focus-within:border-[#1f4d36] focus-within:ring-1 focus-within:ring-[#1f4d36] bg-white transition-all">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3m-6-6a9 9 0 0112 0m-9.5-3.5a6 6 0 017 0m-4.5-1a3 3 0 012 0M12 15a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full text-sm text-gray-900 focus:outline-none bg-transparent appearance-none cursor-pointer pr-6"
            >
              <option value="" disabled hidden>
                Select Operator
              </option>
              {OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <svg className="w-4 h-4 text-gray-400 absolute right-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {errors.operator && <p className="text-xs text-red-500 mt-1">{errors.operator}</p>}
        </div>

        {/* Mobile Number Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Mobile number <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-gray-200 focus-within:border-[#1f4d36] focus-within:ring-1 focus-within:ring-[#1f4d36] bg-white transition-all">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <rect x="7" y="3" width="10" height="18" rx="2" />
              <line x1="11" y1="18" x2="13" y2="18" strokeLinecap="round" />
            </svg>
            <input
              type="tel"
              placeholder="03xx xxxxxxx"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              maxLength={12}
            />
          </div>
          {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-gray-200 focus-within:border-[#1f4d36] focus-within:ring-1 focus-within:ring-[#1f4d36] bg-white transition-all">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0v4" />
            </svg>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
            />
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        {/* reCAPTCHA Mock Container */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-xs">
          <label className="flex items-center gap-3 cursor-pointer select-none text-xs sm:text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={captchaChecked}
              onChange={(e) => setCaptchaChecked(e.target.checked)}
              className="w-4 h-4 rounded text-[#1f4d36] focus:ring-[#1f4d36] border-gray-300 cursor-pointer"
            />
            I'm not a robot
          </label>
          <div className="flex flex-col items-center justify-center text-[9px] text-gray-400 leading-tight">
            <svg className="w-5 h-5 text-blue-500 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" />
            </svg>
            <span>reCAPTCHA</span>
            <span className="text-[8px] text-gray-400">Privacy - Terms</span>
          </div>
        </div>
        {errors.captcha && <p className="text-xs text-red-500">{errors.captcha}</p>}

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#1f4d36] focus:ring-[#1f4d36] border-gray-300 cursor-pointer"
            />
            Remember me
          </label>
          <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[#22c55e] hover:underline font-medium">
            Forgot Password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || busy}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-all shadow-xs mt-2 ${
            isFormValid && !busy
              ? 'bg-[#1f4d36] hover:bg-[#183e2b] text-white cursor-pointer'
              : 'bg-[#f1f5f9] text-[#94a3b8] border border-gray-200 cursor-not-allowed'
          }`}
        >
          {busy ? t('jobs.loading') : 'Login'}
        </button>
      </form>
    </AuthCard>
  );
}
