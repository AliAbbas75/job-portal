import { Link } from 'react-router-dom';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { Logo } from '../common/Logo';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo inverted />
          <p>{t('footer.about')}</p>
        </div>
        <nav aria-label={t('footer.candidatesHeading')}>
          <h2 className={styles.heading}>{t('footer.candidatesHeading')}</h2>
          <ul className={styles.links}>
            <li>
              <Link to={paths.home}>{t('nav.findJobs')}</Link>
            </li>
            <li>
              <Link to={paths.signup}>{t('nav.createAccount')}</Link>
            </li>
            <li>
              <Link to={paths.applications}>{t('nav.myApplications')}</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className={styles.heading}>{t('footer.howHeading')}</h2>
          <ol className={styles.steps}>
            <li>{t('footer.step1')}</li>
            <li>{t('footer.step2')}</li>
            <li>{t('footer.step3')}</li>
          </ol>
        </div>
      </div>
      <div className={styles.bottom}>
        <p className="container">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
