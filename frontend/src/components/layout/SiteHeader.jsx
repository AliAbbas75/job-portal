import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { USE_MOCKS } from '../../api/client';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(location.pathname);
  const signedIn = status === 'authenticated';

  // Close the mobile menu after navigating.
  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname);
    setMenuOpen(false);
  }

  const navClass = ({ isActive }) =>
    cx(
      'block py-3 font-medium no-underline hover:text-heritage md:inline-block md:py-2',
      isActive
        ? 'border-b-3 border-gold text-heritage'
        : 'border-b border-surface text-black md:border-b-3 md:border-transparent',
    );

  return (
    <header className="border-b border-heritage bg-white">
      <div className="bg-heritage text-sm text-white">
        <div className="page flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-2 text-center">
          <p>{t('header.announcement')}</p>
          {USE_MOCKS && (
            <span className="rounded-full bg-gold px-2 font-bold text-black">
              {t('header.demoMode')}
            </span>
          )}
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
            {signedIn && (
              <>
                <li>
                  <NavLink to={paths.applications} className={navClass}>
                    {t('nav.myApplications')}
                  </NavLink>
                </li>
                <li>
                  <NavLink to={paths.profile} className={navClass}>
                    {t('nav.myProfile')}
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            {signedIn ? (
              <>
                <span className="inline-flex items-center gap-1 font-medium text-heritage">
                  <Icon name="user" size={18} />
                  {candidate?.name || t('header.account')}
                </span>
                <Button variant="secondary" size="sm" onClick={signOut}>
                  {t('nav.logOut')}
                </Button>
              </>
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
    </header>
  );
}
