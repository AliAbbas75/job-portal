import { t } from '../../i18n';
import { cx } from '../../utils/cx';
import { Icon } from './Icon';

const APPLY_STEPS = ['identity', 'otp', 'profile', 'documents', 'review', 'confirm'];

/** The apply wizard's 6 step pills. `current` is a step key; 'submitted' marks all as done. */
export function ApplySteps({ current = 'identity' }) {
  const currentIndex =
    current === 'submitted' ? APPLY_STEPS.length : Math.max(0, APPLY_STEPS.indexOf(current));

  return (
    <nav aria-label={t('wizard.progress')} className="w-full">
      <ol className="flex flex-wrap items-center justify-center gap-2 text-sm">
        {APPLY_STEPS.map((step, index) => {
          const done = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li
              key={step}
              aria-current={isCurrent ? 'step' : undefined}
              className={cx(
                'flex items-center gap-1 rounded-full border px-3 py-1.5',
                isCurrent && 'border-heritage bg-surface font-bold text-heritage',
                done && 'border-heritage bg-white font-bold text-heritage',
                !isCurrent && !done && 'border-surface bg-white text-black',
              )}
            >
              {done && <Icon name="check" size={14} />}
              <span>{t(`wizard.steps.${step}`)}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
