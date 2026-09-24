import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';
import { REJECTED, STATUS_FLOW } from '../../../utils/applicationStatuses';
import { cx } from '../../../utils/cx';
import { formatDate } from '../../../utils/format';

const MARKER = {
  done: 'border-heritage bg-heritage text-white',
  current: 'border-gold bg-gold text-black',
  upcoming: 'border-heritage bg-white',
  rejected: 'border-ember bg-ember text-white',
};

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
    <ol>
      {steps.map((status) => {
        const event = reached.get(status);
        const state = status === last.status ? 'current' : event ? 'done' : 'upcoming';
        return (
          <li
            key={status}
            className={cx(
              'relative flex gap-4 pb-5',
              // Connector line down to the next marker: solid once the step is done.
              "not-last:before:absolute not-last:before:top-7 not-last:before:bottom-0 not-last:before:left-[13px] not-last:before:border-l-2 not-last:before:border-heritage not-last:before:content-['']",
              state === 'done' ? 'not-last:before:border-solid' : 'not-last:before:border-dashed',
            )}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span
              className={cx(
                'grid size-7 flex-none place-items-center rounded-full border-2',
                MARKER[status === REJECTED ? 'rejected' : state],
              )}
            >
              {state === 'done' && <Icon name="check" size={14} />}
              {status === REJECTED && <Icon name="x" size={14} />}
            </span>
            <div className="pt-0.5">
              <p
                className={cx(
                  state === 'upcoming' ? 'font-normal' : 'font-bold',
                  state === 'current' && 'text-heritage',
                )}
              >
                {t(`status.${status}`)}
              </p>
              <p className="text-sm">
                {event ? (
                  <>
                    {formatDate(event.at)}
                    {event.note && ` · ${event.note}`}
                  </>
                ) : (
                  t('tracking.upcoming')
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
