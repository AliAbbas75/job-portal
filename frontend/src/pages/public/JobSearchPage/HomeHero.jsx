import { t } from '../../../i18n';
import styles from './JobSearchPage.module.css';

/** Green hero with headline, two headline numbers and the search card (`children`). */
export function HomeHero({ stats, children }) {
  const figures = [
    { value: stats?.openJobs, label: t('hero.statJobs') },
    { value: stats?.vacancies, label: t('hero.statVacancies') },
  ];

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroInner}`}>
        <div className={styles.heroTop}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>{t('hero.eyebrow')}</p>
            <h1 className={styles.heroTitle}>{t('hero.title')}</h1>
            <p className={styles.heroLead}>{t('hero.lead')}</p>
          </div>
          <dl className={styles.stats}>
            {figures.map((figure) => (
              <div key={figure.label} className={styles.stat}>
                <dt className={styles.statLabel}>{figure.label}</dt>
                <dd className={styles.statValue}>{figure.value ?? '–'}</dd>
              </div>
            ))}
          </dl>
        </div>
        {children}
      </div>
    </section>
  );
}
