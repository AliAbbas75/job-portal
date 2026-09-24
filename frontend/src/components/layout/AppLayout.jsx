import { Outlet, useLocation } from 'react-router-dom';
import { t } from '../../i18n';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { FaqSection } from './FaqSection';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function AppLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="absolute -top-24 left-4 z-50 bg-gold px-4 py-2 font-bold text-black no-underline focus:top-2"
      >
        {t('common.skipToContent')}
      </a>
      <SiteHeader />
      <main id="main" className="flex-1 focus:outline-none" tabIndex={-1}>
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <FaqSection />
      <SiteFooter />
    </div>
  );
}
