/** Shared classes for text-like controls. */
export const controlClass =
  'w-full rounded-sm border border-heritage bg-white px-3 py-2 read-only:cursor-not-allowed read-only:bg-surface disabled:cursor-not-allowed disabled:bg-surface aria-invalid:border-2 aria-invalid:border-ember focus-visible:outline-offset-0';

/** Label, hint and error around one form control. `children` gets the ids it must reference. */
export function FieldShell({ id, label, hint, error, required, children }) {
  const labelId = `${id}-label`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label id={labelId} className="font-medium" htmlFor={id}>
        {label}
        {required && (
          <span className="text-ember" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-sm">
          {hint}
        </p>
      )}
      {children({ describedBy, labelId, invalid: Boolean(error) })}
      {error && (
        <p id={errorId} className="text-sm font-medium text-ember">
          {error}
        </p>
      )}
    </div>
  );
}
