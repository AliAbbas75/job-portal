import { cx } from '../../utils/cx';
import { Icon } from './Icon';

const VARIANTS = {
  info: { icon: 'info', classes: 'border-heritage bg-surface text-heritage' },
  success: { icon: 'check', classes: 'border-heritage bg-surface text-black' },
  warning: { icon: 'alert', classes: 'border-pumpkin bg-cream text-black' },
  error: { icon: 'alert', classes: 'border-ember bg-white text-ember' },
};

/** variant: 'info' | 'success' | 'warning' | 'error'. Errors are announced to screen readers. */
export function Alert({ variant = 'info', title, children, action }) {
  const { icon, classes } = VARIANTS[variant];
  return (
    <div
      className={cx('flex items-start gap-3 rounded-sm border border-l-[6px] px-4 py-3', classes)}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <Icon name={icon} size={20} className="mt-0.5 flex-none" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-bold">{title}</p>}
        {children && <div>{children}</div>}
      </div>
      {action && <div className="flex-none self-center">{action}</div>}
    </div>
  );
}
