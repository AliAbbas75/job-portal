import { t } from '../../i18n';
import { cx } from '../../utils/cx';
import { Icon } from './Icon';

const STEPS = ['check', 'review', 'submitted'];

const MARKER = {
  done: 'border-heritage bg-heritage text-white',
  current: 'border-gold bg-gold text-black',
  upcoming: 'border-heritage',
};

/** Progress through the apply flow. `current` is one of STEPS. */
export function ApplySteps({ current }) {
  const currentIndex = STEPS.indexOf(current);
  return (
    <ol className="flex flex-wrap gap-x-5 gap-y-2" aria-label={t('apply.stepsLabel')}>
      {STEPS.map((step, index) => {
        const state =
          index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
        return (
          <li
            key={step}
            className={cx(
              'inline-flex items-center gap-2',
              state === 'current' ? 'font-bold text-heritage' : 'font-medium',
            )}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span
              className={cx(
                'grid size-6.5 place-items-center rounded-full border-2 text-sm font-bold',
                MARKER[state],
              )}
            >
              {state === 'done' ? <Icon name="check" size={14} /> : index + 1}
            </span>
            {t(`apply.steps.${step}`)}
          </li>
        );
      })}
    </ol>
  );
}
