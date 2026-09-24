import { t } from '../../i18n';
import { Icon } from './Icon';
import styles from './ApplySteps.module.css';

const STEPS = ['check', 'review', 'submitted'];

/** Progress through the apply flow. `current` is one of STEPS. */
export function ApplySteps({ current }) {
  const currentIndex = STEPS.indexOf(current);
  return (
    <ol className={styles.steps} aria-label={t('apply.stepsLabel')}>
      {STEPS.map((step, index) => {
        const state =
          index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
        return (
          <li
            key={step}
            className={`${styles.step} ${styles[state]}`}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className={styles.marker}>
              {state === 'done' ? <Icon name="check" size={14} /> : index + 1}
            </span>
            {t(`apply.steps.${step}`)}
          </li>
        );
      })}
    </ol>
  );
}
