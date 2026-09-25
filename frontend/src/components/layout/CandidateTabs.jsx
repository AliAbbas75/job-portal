import { Link } from 'react-router-dom';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { cx } from '../../utils/cx';

/** "Dashboard | My Profile" switch at the top of the candidate portal pages. */
export function CandidateTabs({ current }) {
  const tabs = [
    { key: 'dashboard', to: paths.applications },
    { key: 'profile', to: paths.profile },
  ];
  return (
    <nav
      aria-label={t('dashboard.tabs.label')}
      className="flex items-center gap-1 rounded-md border border-heritage bg-white p-1"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          to={tab.to}
          aria-current={current === tab.key ? 'page' : undefined}
          className={cx(
            'rounded-sm px-4 py-1.5 text-sm no-underline',
            current === tab.key ? 'bg-surface font-bold text-heritage' : 'text-black',
          )}
        >
          {t(`dashboard.tabs.${tab.key}`)}
        </Link>
      ))}
    </nav>
  );
}
