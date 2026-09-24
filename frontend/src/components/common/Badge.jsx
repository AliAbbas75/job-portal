import { cx } from '../../utils/cx';

const VARIANTS = {
  gold: 'border-transparent bg-gold text-black',
  green: 'border-transparent bg-heritage text-white',
  soft: 'border-transparent bg-surface text-heritage',
  cream: 'border-black bg-cream text-black',
  red: 'border-transparent bg-ember text-white',
  outline: 'border-heritage bg-white text-heritage',
};

/** variant: 'gold' | 'green' | 'soft' | 'cream' | 'red' | 'outline' */
export function Badge({ variant = 'soft', children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-medium whitespace-nowrap',
        VARIANTS[variant],
      )}
    >
      {children}
    </span>
  );
}
