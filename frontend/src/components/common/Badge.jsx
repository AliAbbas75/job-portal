import styles from './Badge.module.css';

/** variant: 'gold' | 'green' | 'soft' | 'cream' | 'red' | 'outline' */
export function Badge({ variant = 'soft', children }) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}
