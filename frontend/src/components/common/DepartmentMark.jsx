import styles from './DepartmentMark.module.css';

/** Square department badge, used where a company logo would sit in job lists and headers. */
export function DepartmentMark({ code, name, size = 'md' }) {
  return (
    <span className={`${styles.mark} ${styles[size]}`} title={name} aria-hidden="true">
      {code}
    </span>
  );
}
