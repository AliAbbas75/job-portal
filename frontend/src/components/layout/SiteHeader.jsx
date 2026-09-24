import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { USE_MOCKS } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Logo } from '../common/Logo';
import styles from './SiteHeader.module.css';

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

  const navClass = ({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`;

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarInner}`}>
          <p>{t('header.announcement')}</p>
          {USE_MOCKS && <span className={styles.demo}>{t('header.demoMode')}</span>}
        </div>
      </div>

      <div className={`container ${styles.main}`}>
        <Link to={paths.home} className={styles.logoLink} aria-label={t('header.homeLink')}>
          <Logo />
        </Link>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'x' : 'menu'} size={22} />
          <span className="visually-hidden">{t('header.menu')}</span>
        </button>

        <nav
          id="site-nav"
          className={`${styles.nav} ${menuOpen ? styles.open : ''}`}
          aria-label={t('header.navLabel')}
        >
          <ul className={styles.links}>
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

          <div className={styles.account}>
            {signedIn ? (
              <>
                <span className={styles.user}>
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
