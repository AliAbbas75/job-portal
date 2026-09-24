import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';
import { REJECTED, STATUS_FLOW } from '../../../utils/applicationStatuses';
import { formatDate } from '../../../utils/format';
import styles from './ApplicationDetailPage.module.css';

/** Vertical timeline of the §4.9 statuses, built from the application's status events. */
export function StatusTimeline({ events }) {
  const reached = new Map(events.map((event) => [event.status, event]));
  const last = events[events.length - 1];
  const rejected = last.status === REJECTED;

  // After a rejection, stop the timeline at the rejection instead of listing future steps.
  const steps = rejected
    ? [...STATUS_FLOW.filter((status) => reached.has(status)), REJECTED]
    : STATUS_FLOW;

  return (
    <ol className={styles.timeline}>
      {steps.map((status) => {
        const event = reached.get(status);
        const state = status === last.status ? 'current' : event ? 'done' : 'upcoming';
        return (
          <li
            key={status}
            className={`${styles.step} ${styles[state]} ${status === REJECTED ? styles.rejected : ''}`}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className={styles.marker}>
              {state === 'done' && <Icon name="check" size={14} />}
              {status === REJECTED && <Icon name="x" size={14} />}
            </span>
            <div className={styles.stepBody}>
              <p className={styles.stepTitle}>{t(`status.${status}`)}</p>
              {event ? (
                <p className={styles.stepMeta}>
                  {formatDate(event.at)}
                  {event.note && ` · ${event.note}`}
                </p>
              ) : (
                <p className={styles.stepMeta}>{t('tracking.upcoming')}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
