import { t } from '../../i18n';
import { errorMessage } from '../../utils/errorMessage';
import { Button } from './Button';
import { Icon } from './Icon';

const stateClass = 'flex flex-col items-center gap-3 px-4 py-16 text-center';

export function LoadingState({ label }) {
  return (
    <div className={stateClass} role="status">
      <span
        className="size-8 animate-spin rounded-full border-3 border-surface border-t-heritage"
        aria-hidden="true"
      />
      <p>{label ?? t('common.loading')}</p>
    </div>
  );
}

export function EmptyState({ icon = 'search', title, description, action }) {
  return (
    <div className={stateClass}>
      <span className="grid size-16 place-items-center rounded-full bg-surface text-heritage">
        <Icon name={icon} size={28} />
      </span>
      <h2 className="text-xl">{title}</h2>
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
