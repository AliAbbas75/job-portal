import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { cx } from '../../utils/cx';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Logo } from '../common/Logo';

export function SiteHeader() {
  const { status, candidate, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(location.pathname);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Reset password form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  const signedIn = status === 'authenticated';

  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname);
    setMenuOpen(false);
    setDropdownOpen(false);
  }

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate(paths.home);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    setResetBusy(true);
    setTimeout(() => {
      setResetBusy(false);
      setResetSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setResetModalOpen(false);
        setResetSuccess(false);
      }, 1500);
    }, 600);
  };

  const navClass = ({ isActive }) =>
    cx(
      'block py-3 font-medium no-underline hover:text-heritage md:inline-block md:py-2',
      isActive
        ? 'border-b-3 border-gold text-heritage'
        : 'border-b border-surface text-black md:border-b-3 md:border-transparent',
    );

  return (
    <header className="border-b border-heritage bg-white font-['Instrument_Sans',sans-serif] relative z-40">
      <div className="bg-[#A63A2C] text-sm text-white">
        <div className="page flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-2 text-center">
          <p className="w-full text-center font-medium">{t('header.announcement')}</p>
        </div>
      </div>

      <div className="page flex min-h-18 flex-wrap items-center justify-between gap-4 py-2">
        <Link to={paths.home} className="no-underline" aria-label={t('header.homeLink')}>
          <Logo />
        </Link>

        <button
          type="button"
          className="inline-flex cursor-pointer rounded-sm border border-heritage bg-white p-2 text-heritage md:hidden"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'x' : 'menu'} size={22} />
          <span className="sr-only">{t('header.menu')}</span>
        </button>

        <nav
          id="site-nav"
          className={cx(
            'basis-full flex-col items-stretch gap-4 pb-4 md:flex md:flex-1 md:basis-auto md:flex-row md:items-center md:justify-end md:gap-5 md:pb-0',
            menuOpen ? 'flex' : 'hidden',
          )}
          aria-label={t('header.navLabel')}
        >
          <ul className="flex flex-col md:flex-row md:gap-5">
            <li>
              <NavLink to={paths.home} end className={navClass}>
                {t('nav.findJobs')}
              </NavLink>
            </li>
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            {signedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 shadow-2xs bg-white"
                  aria-expanded={dropdownOpen}
                >
                  {candidate?.avatarUrl ? (
                    <img
                      src={candidate.avatarUrl}
                      alt={candidate.name || 'Candidate Avatar'}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-600"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#1f4d36] text-white flex items-center justify-center font-bold text-xs border border-emerald-600">
                      {(candidate?.name || 'Tariq Ahmed').charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-800 hidden sm:inline-block">
                    {candidate?.name || 'Tariq Ahmed'}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900">{candidate?.name || 'Tariq Ahmed'}</p>
                      <p className="text-[11px] text-gray-400 truncate">{candidate?.cnic || '4220139738233'}</p>
                    </div>

                    <Link
                      to={paths.applications}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-emerald-700 no-underline transition-colors"
                    >
                      <span>📊</span> Dashboard
                    </Link>

                    <Link
                      to={paths.profile}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-emerald-700 no-underline transition-colors"
                    >
                      <span>👤</span> My Profile
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        setResetModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-emerald-700 text-left transition-colors cursor-pointer bg-none border-none"
                    >
                      <span>🔑</span> Reset Password
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer bg-none border-none"
                    >
                      <span>🚪</span> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              status !== 'loading' && (
                <>
                  <Button to={paths.login} variant="secondary" size="sm">
                    {t('nav.logIn')}
                  </Button>
                  <Button to={paths.signup} size="sm">
                    {t('nav.createAccount')}
                  </Button>
                </>
              )
            )}
          </div>
        </nav>
      </div>

      {/* Reset Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🔑</span> Reset Password
              </h2>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold bg-none border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {resetSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-800 text-xs font-semibold">
                ✓ Password updated successfully!
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
                {resetError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {resetError}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetBusy}
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#1f4d36] hover:bg-[#183e2b] text-white border-none cursor-pointer shadow-xs"
                  >
                    {resetBusy ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
