import { Outlet, useLocation } from 'react-router-dom';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { FaqSection } from './FaqSection';
import { JobsByCategoryAndBps } from './JobsByCategoryAndBps';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/**
 * Public header (not on admin pages), the page, and on the home page only "Jobs by category /
 * BPS", the FAQ and the footer.
 */
export function AppLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === paths.home;
  const isLogin = pathname === paths.login;
  const isSignup = pathname === paths.signup;
  const isAuth = isLogin || isSignup;
  const isAdmin = pathname.startsWith(paths.admin);

  if (isAuth) {
    return (
      <div className="flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-white">
        <a
          href="#main"
          className="absolute -top-24 left-4 z-50 bg-gold px-4 py-2 font-bold text-black no-underline focus:top-2"
        >
          {t('common.skipToContent')}
        </a>
        <SiteHeader isAuth />
        <main
          id="main"
          className="relative flex flex-1 w-full focus:outline-none"
          tabIndex={-1}
        >
          <ErrorBoundary key={pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="absolute -top-24 left-4 z-50 bg-gold px-4 py-2 font-bold text-black no-underline focus:top-2"
      >
        {t('common.skipToContent')}
      </a>
      {!isAdmin && <SiteHeader />}
      <main id="main" className="flex-1 focus:outline-none" tabIndex={-1}>
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      {isHome && (
        <>
          <JobsByCategoryAndBps />
          <FaqSection />
        </>
      )}
      {!isAdmin && <SiteFooter />}
    </div>
  );
}
