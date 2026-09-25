import { t } from '../../i18n';
import { cx } from '../../utils/cx';
import { Select } from '../forms/Select';
import { Icon } from './Icon';

/** Page numbers to show: first, last, and the current page with one neighbour each side. */
function pageList(page, pages) {
  const wanted = new Set([1, pages, page - 1, page, page + 1]);
  const list = [];
  for (let n = 1; n <= pages; n += 1) {
    if (wanted.has(n)) list.push(n);
    else if (list.at(-1) !== '…') list.push('…');
  }
  return list;
}

/** "Results per page", "1–10 of 29" and numbered pages. */
export function Pagination({ page, pageSize, total, sizes, onPage, onPageSize }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  const buttonClass =
    'inline-flex size-9 cursor-pointer items-center justify-center rounded-sm border font-medium disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-sm">
        <span aria-hidden="true">{t('jobs.pagination.perPage')}</span>
        <div className="w-24">
          <Select
            ariaLabel={t('jobs.pagination.perPage')}
            options={sizes.map((size) => ({ value: String(size), label: String(size) }))}
            value={String(pageSize)}
            onChange={(value) => onPageSize(Number(value))}
          />
        </div>
        <span>{t('jobs.pagination.range', { first, last, total })}</span>
      </div>

      <nav aria-label={t('jobs.pagination.label')}>
        <ul className="flex items-center gap-1">
          <li>
            <button
              type="button"
              className={cx(buttonClass, 'border-heritage bg-white text-heritage')}
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
            >
              <Icon name="arrowLeft" size={16} />
              <span className="sr-only">{t('jobs.pagination.previous')}</span>
            </button>
          </li>
          {pageList(page, pages).map((n, index) =>
            n === '…' ? (
              <li key={`gap-${index}`} aria-hidden="true" className="px-1">
                …
              </li>
            ) : (
              <li key={n}>
                <button
                  type="button"
                  aria-current={n === page ? 'page' : undefined}
                  className={cx(
                    buttonClass,
                    n === page
                      ? 'border-heritage bg-heritage text-white'
                      : 'border-heritage bg-white text-heritage',
                  )}
                  onClick={() => onPage(n)}
                >
                  {n}
                </button>
              </li>
            ),
          )}
          <li>
            <button
              type="button"
              className={cx(buttonClass, 'border-heritage bg-white text-heritage')}
              disabled={page >= pages}
              onClick={() => onPage(page + 1)}
            >
              <Icon name="chevronRight" size={16} />
              <span className="sr-only">{t('jobs.pagination.next')}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
