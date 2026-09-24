import { Link } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';

/** One summary block on the review page. `rows` is [{ label, value }]; `children` overrides rows. */
export function ReviewSection({ title, editTo, rows, children }) {
  return (
    <section className="rounded-md border border-heritage p-4 sm:px-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg">{title}</h2>
        {editTo && (
          <Link
            to={editTo}
            className="inline-flex items-center gap-1 font-medium"
            aria-label={t('review.editNamed', { name: title })}
          >
            <Icon name="edit" size={14} />
            {t('profile.edit')}
          </Link>
        )}
      </div>
      {children ?? (
        <dl className="grid gap-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid sm:grid-cols-[180px_1fr] sm:gap-3 [&_dd]:wrap-anywhere [&_dt]:font-medium [&_dt]:text-heritage"
            >
              <dt>{row.label}</dt>
              <dd>{row.value || '—'}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
