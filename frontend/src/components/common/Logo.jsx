import { t } from '../../i18n';
import { cx } from '../../utils/cx';

/**
 * PLACEHOLDER wordmark until the official logo files are added to the repo.
 * When they arrive, replace only this component's markup with the primary horizontal lockup
 * (brand guide §3: min 20px, keep clear space, no effects or recoloring).
 */
export function Logo({ inverted = false }) {
  return (
    <span
      className={cx(
        'inline-flex flex-col py-1 leading-[1.05]',
        inverted ? 'text-white' : 'text-heritage',
      )}
    >
      <span className="text-xl font-bold tracking-wide uppercase">{t('app.brand')}</span>
      <span
        className={cx('text-sm font-medium tracking-[0.2em] uppercase', inverted && 'text-gold')}
      >
        {t('app.careers')}
      </span>
    </span>
  );
}
