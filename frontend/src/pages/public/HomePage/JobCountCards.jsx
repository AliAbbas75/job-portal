import { Link } from 'react-router-dom';
import { t } from '../../../i18n';
import { cx } from '../../../utils/cx';

/** A titled grid of "N jobs available →" cards, each linking to a filtered job list. */
export function JobCountCards({ id, title, items, tinted = false }) {
  if (items.length === 0) return null;
  return (
    <section
      id={id}
      className={cx('scroll-mt-4 py-12', tinted ? 'bg-surface' : 'bg-white')}
      aria-labelledby={`${id}-heading`}
    >
      <div className="page flex flex-col gap-6">
        <h2 id={`${id}-heading`} className="text-3xl">
          {title}
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                to={item.to}
                className="flex h-full flex-col gap-1 rounded-md border border-heritage bg-white p-4 text-black no-underline hover:bg-cream"
              >
                <span className="font-bold text-heritage">{item.label}</span>
                <span className="text-sm">{t('home.jobsAvailable', { count: item.count })} →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
