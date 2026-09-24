import { useId } from 'react';
import styles from './Field.module.css';
import { FieldShell } from './FieldShell';

/** options: [{ value, label }]. `placeholder` adds an empty first option. */
export function SelectField({
  label,
  hint,
  error,
  required,
  options,
  placeholder,
  id,
  ...selectProps
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, invalid }) => (
        <select
          id={fieldId}
          className={styles.control}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...selectProps}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}
