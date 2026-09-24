import { useId } from 'react';
import { FieldShell } from './FieldShell';
import { Select } from './Select';

/** Labelled Select. options: [{ value, label }]; onChange(value). */
export function SelectField({ label, hint, error, required, id, ...selectProps }) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, labelId, invalid }) => (
        <Select
          id={fieldId}
          labelledBy={labelId}
          describedBy={describedBy}
          invalid={invalid}
          {...selectProps}
        />
      )}
    </FieldShell>
  );
}
