import { t } from '../../i18n';
import styles from './Logo.module.css';

/**
 * PLACEHOLDER wordmark until the official logo files are added to the repo.
 * When they arrive, replace only this component's markup with the primary horizontal lockup
 * (brand guide §3: min 20px, keep clear space, no effects or recoloring).
 */
export function Logo({ inverted = false }) {
  return (
    <span className={`${styles.logo} ${inverted ? styles.inverted : ''}`}>
      <span className={styles.wordmark}>{t('app.brand')}</span>
      <span className={styles.tag}>{t('app.careers')}</span>
    </span>
  );
}
