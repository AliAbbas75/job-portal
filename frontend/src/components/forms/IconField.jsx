import { useId } from 'react';
import { Icon } from '../common/Icon';

/**
 * Labelled text input in a bordered box with a leading icon (signup, login, apply wizard).
 * Other props go to the <input>.
 */
export function IconField({ label, icon, error, required, id, ...inputProps }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-bold">
        {label} {required && <span className="text-ember">*</span>}
      </label>
      <div className="flex items-center gap-2.5 rounded-md border border-heritage bg-white px-3.5 py-2.5 focus-within:outline-3 focus-within:outline-heritage">
        {icon && <Icon name={icon} size={20} className="flex-none text-heritage" />}
        <input
          id={fieldId}
          className="w-full bg-transparent text-base focus:outline-none"
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-sm font-medium text-ember">
          {error}
        </p>
      )}
    </div>
  );
}
