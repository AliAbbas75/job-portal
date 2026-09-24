import styles from './ProgressBar.module.css';

export function ProgressBar({ value, label }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  );
}
