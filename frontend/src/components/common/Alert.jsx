import styles from './Alert.module.css';
import { Icon } from './Icon';

const ICONS = { info: 'info', success: 'check', warning: 'alert', error: 'alert' };

/** variant: 'info' | 'success' | 'warning' | 'error'. Errors are announced to screen readers. */
export function Alert({ variant = 'info', title, children, action }) {
  return (
    <div
      className={`${styles.alert} ${styles[variant]}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <Icon name={ICONS[variant]} size={20} className={styles.icon} />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div>{children}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
