export function ProgressBar({ value, label }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className="h-2.5 overflow-hidden rounded-full border border-heritage bg-white"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span
        className="block h-full bg-heritage transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
