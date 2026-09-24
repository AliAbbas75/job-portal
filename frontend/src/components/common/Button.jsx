import { Link } from 'react-router-dom';
import styles from './Button.module.css';

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
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.full : '',
    className,
  ].join(' ');

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
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
