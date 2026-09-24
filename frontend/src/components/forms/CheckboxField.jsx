import styles from './Field.module.css';

export function CheckboxField({ label, description, error, ...inputProps }) {
  return (
    <div className={styles.field}>
      <label className={styles.checkbox}>
        <input type="checkbox" aria-invalid={Boolean(error) || undefined} {...inputProps} />
        <span>
          <span className={styles.label}>{label}</span>
          {description && <span className={styles.hint}> {description}</span>}
        </span>
      </label>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
