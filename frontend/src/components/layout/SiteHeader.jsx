import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { cx } from '../../utils/cx';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Logo } from '../common/Logo';

/** Announcement bar, logo, "Find jobs" and the account menu (design: Malaika). */
export function SiteHeader() {
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
  useEffect(() => {
    if (!accountOpen) return undefined;
    const onClick = (event) => {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const onKey = (event) => event.key === 'Escape' && setAccountOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

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
    <header className="relative z-40 border-b border-heritage bg-white">
      <div className="bg-ember text-sm text-white">
        <p className="page py-2 text-center font-medium">{t('header.announcement')}</p>
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
              <NavLink to={paths.jobs} className={navClass}>
                {t('nav.findJobs')}
              </NavLink>
            </li>
          </ul>

          <div className="flex flex-wrap items-center gap-3">
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
            {!signedIn && status !== 'loading' && (
              <>
                <Button to={paths.login} variant="secondary" size="sm">
                  {t('nav.logIn')}
                </Button>
                <Button to={paths.signup} size="sm">
                  {t('nav.createAccount')}
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
