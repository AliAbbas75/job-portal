import { cx } from '../../utils/cx';

/** Square department badge, used where a company logo would sit in job headers. */
export function DepartmentMark({ code, name, size = 'md' }) {
  return (
    <span
      className={cx(
        'grid flex-none place-items-center rounded-md border border-heritage bg-surface font-bold tracking-wider text-heritage',
        size === 'lg' ? 'size-14 text-sm sm:size-18 sm:text-base' : 'size-14 text-sm',
      )}
      title={name}
      aria-hidden="true"
    >
      {code}
    </span>
  );
}
