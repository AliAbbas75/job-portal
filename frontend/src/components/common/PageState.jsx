import { t } from '../../i18n';
import { errorMessage } from '../../utils/errorMessage';
import { Button } from './Button';
import { Icon } from './Icon';
import styles from './PageState.module.css';

export function LoadingState({ label }) {
  return (
    <div className={styles.state} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <p>{label ?? t('common.loading')}</p>
    </div>
  );
}

export function EmptyState({ icon = 'search', title, description, action }) {
  return (
    <div className={styles.state}>
      <span className={styles.iconWrap}>
        <Icon name={icon} size={28} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <EmptyState
      icon="alert"
      title={t('errors.loadFailed')}
      description={errorMessage(error)}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )
      }
    />
  );
}
