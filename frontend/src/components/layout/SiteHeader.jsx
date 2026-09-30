import { useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDismiss } from '../../hooks/useDismiss';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { cx } from '../../utils/cx';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Logo } from '../common/Logo';

/** Announcement bar, logo, "Find jobs" and the account menu (design: Malaika). */
export function SiteHeader({ isAuth = false, isLogin = false }) {
  const isAuthPage = isAuth || isLogin;
  const { status, candidate, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(location.pathname);
  const accountRef = useRef(null);
  const signedIn = status === 'authenticated';

  // Close menus after navigating.
  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname);
    setMenuOpen(false);
    setAccountOpen(false);
  }

  // Close the account menu on an outside click or Escape.
  useDismiss(accountRef, accountOpen, () => setAccountOpen(false));

  async function logOut() {
    setAccountOpen(false);
    await signOut();
    navigate(paths.home);
  }

  const navClass = ({ isActive }) =>
    cx(
      'block py-3 font-medium no-underline hover:text-heritage md:inline-block md:py-2',
      isActive
        ? 'border-b-3 border-gold text-heritage'
        : 'border-b border-surface text-black md:border-b-3 md:border-transparent',
    );
  const menuItem =
    'flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-left text-sm font-medium no-underline hover:bg-surface';
  const name = candidate?.name || t('header.account');

  return (
    <header className="relative z-40 border-b border-heritage/20 bg-white print:hidden">
      {!isAuthPage && (
        <div className="bg-ember text-sm text-white">
          <p className="page py-2 text-center font-medium">{t('header.announcement')}</p>
        </div>
      )}

      <div
        className={cx(
          'page flex flex-wrap items-center justify-between gap-4',
          isAuthPage ? 'min-h-14 py-2' : 'min-h-18 py-2',
        )}
      >
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
            'basis-full flex-col items-stretch gap-4 pb-4 md:flex md:flex-1 md:basis-auto md:flex-row md:items-center md:justify-between md:gap-4 md:pb-0',
            menuOpen ? 'flex' : 'hidden',
          )}
          aria-label={t('header.navLabel')}
        >
          {isAuthPage ? (
            <ul className="flex flex-col md:mx-auto md:flex-row md:items-center md:justify-center md:gap-7">
              <li>
                <NavLink
                  to={paths.home}
                  className="inline-block py-1 text-sm font-medium text-black no-underline hover:text-heritage"
                  end
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={paths.jobs}
                  className="inline-flex items-center gap-1 py-1 text-sm font-medium text-black no-underline hover:text-heritage"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>Available Jobs</span>
                </NavLink>
              </li>
              <li>
                <a
                  href="/#categories"
                  className="inline-flex items-center gap-1 py-1 text-sm font-medium text-black no-underline hover:text-heritage"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>Job Categories</span>
                </a>
              </li>
              <li>
                <a
                  href="/#how-to-apply"
                  className="py-1 text-sm font-medium text-black no-underline hover:text-heritage"
                  onClick={() => setMenuOpen(false)}
                >
                  How to Apply
                </a>
              </li>
              <li>
                <a
                  href="/#faqs"
                  className="py-1 text-sm font-medium text-black no-underline hover:text-heritage"
                  onClick={() => setMenuOpen(false)}
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="/#contact"
                  className="py-1 text-sm font-medium text-black no-underline hover:text-heritage"
                  onClick={() => setMenuOpen(false)}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          ) : (
            <ul className="flex flex-col md:mx-auto md:flex-row md:items-center md:justify-center md:gap-6">
              <li>
                <NavLink
                  to={paths.home}
                  className={navClass}
                  end
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={paths.jobs}
                  className={navClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Available Jobs
                </NavLink>
              </li>
              <li>
                <a
                  href="/#categories"
                  className="py-2 font-medium text-black no-underline hover:text-heritage"
                  onClick={() => setMenuOpen(false)}
                >
                  Job Categories
                </a>
              </li>
              <li>
                <a
                  href="/#how-to-apply"
                  className="py-2 font-medium text-black no-underline hover:text-heritage"
                  onClick={() => setMenuOpen(false)}
                >
                  How to Apply
                </a>
              </li>
              <li>
                <a
                  href="/#faqs"
                  className="py-2 font-medium text-black no-underline hover:text-heritage"
                  onClick={() => setMenuOpen(false)}
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="/#contact"
                  className="py-2 font-medium text-black no-underline hover:text-heritage"
                  onClick={() => setMenuOpen(false)}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            {signedIn && (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-heritage bg-white px-3 py-1.5 hover:bg-surface"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-label={t('header.accountMenu')}
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-heritage text-sm font-bold text-white">
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden text-sm font-bold sm:inline">{name}</span>
                  <Icon
                    name="chevronDown"
                    size={16}
                    className={cx(
                      'text-heritage transition-transform',
                      accountOpen && 'rotate-180',
                    )}
                  />
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-heritage bg-white py-1"
                  >
                    <div className="border-b border-surface px-4 py-2">
                      <p className="text-sm font-bold">{name}</p>
                      {candidate?.cnic && <p className="truncate text-xs">{candidate.cnic}</p>}
                    </div>
                    <Link
                      role="menuitem"
                      to={paths.applications}
                      className={cx(menuItem, 'text-black')}
                    >
                      <Icon name="briefcase" size={16} className="text-heritage" />
                      {t('header.dashboard')}
                    </Link>
                    <Link role="menuitem" to={paths.profile} className={cx(menuItem, 'text-black')}>
                      <Icon name="user" size={16} className="text-heritage" />
                      {t('header.profile')}
                    </Link>
                    <div className="my-1 border-t border-surface" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={logOut}
                      className={cx(menuItem, 'text-ember')}
                    >
                      <Icon name="arrowLeft" size={16} />
                      {t('nav.logOut')}
                    </button>
                  </div>
                )}
              </div>
            )}
            {!signedIn && status !== 'loading' && !isAuthPage && (
              <div className="flex items-center gap-2">
                <Link
                  to={paths.jobs}
                  className="hidden size-8 items-center justify-center rounded text-black/60 no-underline transition-colors hover:text-heritage md:flex"
                  aria-label="Search jobs"
                >
                  <Icon name="search" size={17} />
                </Link>
                <Link
                  to={paths.login}
                  className="border-stone-300 flex items-center gap-1.5 rounded border bg-white px-3 py-1.5 text-xs font-semibold text-black no-underline transition-colors hover:border-heritage hover:text-heritage"
                >
                  <Icon name="logIn" size={14} />
                  <span>{t('nav.logIn')}</span>
                </Link>
                <span className="text-stone-300 select-none" aria-hidden="true">
                  |
                </span>
                <Link
                  to={paths.signup}
                  className="shadow-xs flex items-center gap-1.5 rounded bg-ember px-3.5 py-1.5 text-xs font-semibold text-white no-underline transition-colors hover:opacity-90"
                >
                  <Icon name="user" size={14} />
                  <span>{t('nav.signUp')}</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
