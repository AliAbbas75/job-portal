import { useId } from 'react';
import styles from './Field.module.css';
import { FieldShell } from './FieldShell';

/** Text input, or a textarea when `multiline` is set. Other props go to the control. */
export function TextField({ label, hint, error, required, multiline = false, id, ...inputProps }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const Control = multiline ? 'textarea' : 'input';

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, invalid }) => (
        <Control
          id={fieldId}
          className={styles.control}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
      )}
    </FieldShell>
  );
}
