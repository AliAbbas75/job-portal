import styles from './AuthCard.module.css';

/** Centered card on a cream background for sign-up and login. */
export function AuthCard({ title, lead, children, footer }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
