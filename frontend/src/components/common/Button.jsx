import { Link } from 'react-router-dom';
import { cx } from '../../utils/cx';

const VARIANTS = {
  primary: 'border-transparent bg-heritage text-white hover:enabled:bg-black [a&]:hover:bg-black',
  accent: 'border-transparent bg-gold text-black hover:enabled:bg-pumpkin [a&]:hover:bg-pumpkin',
  secondary:
    'border-heritage bg-white text-heritage hover:enabled:bg-surface [a&]:hover:bg-surface',
  danger: 'border-transparent bg-ember text-white hover:enabled:bg-black [a&]:hover:bg-black',
  ghost: 'border-transparent bg-transparent text-heritage hover:underline',
};

const SIZES = {
  sm: 'py-1.5 text-sm',
  md: 'py-2.5 text-base',
  lg: 'py-3.5 text-lg',
};

const PADDING_X = { sm: 'px-3.5', md: 'px-5', lg: 'px-7' };

/**
 * variant: 'primary' (green) | 'accent' (gold, main call to action) | 'secondary' | 'danger' | 'ghost'
 * size: 'sm' | 'md' | 'lg'. Pass `to` to render a router link styled as a button.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  to,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  const classes = cx(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 leading-tight font-bold no-underline transition-colors',
    'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface disabled:text-heritage',
    SIZES[size],
    variant === 'ghost' ? 'px-2' : PADDING_X[size],
    VARIANTS[variant],
    fullWidth && 'w-full',
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
