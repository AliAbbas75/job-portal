import { Outlet, useLocation } from 'react-router-dom';
import { t } from '../../i18n';
import { ErrorBoundary } from '../common/ErrorBoundary';
import styles from './AppLayout.module.css';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function AppLayout() {
  const { pathname } = useLocation();
  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skipLink}>
        {t('common.skipToContent')}
      </a>
      <SiteHeader />
      <main id="main" className={styles.main} tabIndex={-1}>
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <SiteFooter />
    </div>
  );
}
