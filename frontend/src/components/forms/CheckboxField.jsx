export function CheckboxField({ label, description, error, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-0.5 size-5 flex-none accent-heritage"
          aria-invalid={Boolean(error) || undefined}
          {...inputProps}
        />
        <span>
          <span className="font-medium">{label}</span>
          {description && <span className="text-sm"> {description}</span>}
        </span>
      </label>
      {error && <p className="text-sm font-medium text-ember">{error}</p>}
    </div>
  );
}
