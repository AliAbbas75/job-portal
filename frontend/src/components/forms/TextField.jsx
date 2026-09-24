import { useId } from 'react';
import { cx } from '../../utils/cx';
import { controlClass, FieldShell } from './FieldShell';

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
          className={cx(controlClass, multiline ? 'min-h-22 resize-y' : 'min-h-11')}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
      )}
    </FieldShell>
  );
}
