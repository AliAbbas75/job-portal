import { Link, useSearchParams } from 'react-router-dom';
import { listDocuments } from '../../../api/documents';
import { getProfile } from '../../../api/profile';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { ProgressBar } from '../../../components/common/ProgressBar';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { safeNext } from '../../../utils/safeNext';
import { AdditionalSection } from './AdditionalSection';
import { ContactSection } from './ContactSection';
import { DocumentsSection } from './DocumentsSection';
import { DomicileSection } from './DomicileSection';
import { EducationSection } from './EducationSection';
import { ExperienceSection } from './ExperienceSection';
import { PersonalSection } from './PersonalSection';
import styles from './ProfilePage.module.css';
import { completion, SECTIONS } from './sections';
import { SkillsSection } from './SkillsSection';

const COMPONENTS = {
  personal: PersonalSection,
  contact: ContactSection,
  domicile: DomicileSection,
  education: EducationSection,
  experience: ExperienceSection,
  skills: SkillsSection,
  additional: AdditionalSection,
};

export default function ProfilePage() {
  useDocumentTitle(t('profile.title'));
  const [searchParams] = useSearchParams();
  const profile = useAsync(getProfile, []);
  const documents = useAsync(listDocuments, []);
  const { data: reference } = useReferenceData();

  const current = SECTIONS.some((s) => s.id === searchParams.get('section'))
    ? searchParams.get('section')
    : 'personal';
  const returnTo = safeNext(searchParams.get('returnTo'), null);
  const sectionLink = (id) => {
    const params = new URLSearchParams({ section: id });
    if (returnTo) params.set('returnTo', returnTo);
    return `${paths.profile}?${params}`;
  };

  const error = profile.error ?? documents.error;
  if (error) {
    return (
      <div className="container">
        <ErrorState
          error={error}
          onRetry={() => {
            profile.reload();
            documents.reload();
          }}
        />
      </div>
    );
  }
  if (!profile.data || !documents.data) return <LoadingState />;

  const percent = completion(profile.data, documents.data);
  const Section = COMPONENTS[current];

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <div>
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.lead')}</p>
        </div>
        <div className={styles.progress}>
          <p>
            <strong>{t('profile.completion', { percent: Math.round(percent) })}</strong>
          </p>
          <ProgressBar value={percent} label={t('profile.completionLabel')} />
        </div>
      </header>

      {returnTo && (
        <Alert
          variant="info"
          title={t('profile.returnTitle')}
          action={
            <Button to={returnTo} size="sm">
              {t('profile.returnAction')}
            </Button>
          }
        >
          {t('profile.returnBody')}
        </Alert>
      )}

      <div className={styles.layout}>
        <nav className={styles.sectionNav} aria-label={t('profile.sectionsLabel')}>
          <ul>
            {SECTIONS.map((section) => {
              const done = section.isComplete(profile.data, documents.data);
              return (
                <li key={section.id}>
                  <Link
                    to={sectionLink(section.id)}
                    className={`${styles.navItem} ${current === section.id ? styles.navActive : ''}`}
                    aria-current={current === section.id ? 'page' : undefined}
                  >
                    <span className={`${styles.navIcon} ${done ? styles.navDone : ''}`}>
                      {done && <Icon name="check" size={14} />}
                    </span>
                    <span>
                      {t(`profile.sections.${section.id}`)}
                      {!section.required && (
                        <span className={styles.optional}> {t('fields.optionalTag')}</span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <section className={styles.content} aria-labelledby="section-title">
          <h2 id="section-title" className={styles.sectionTitle}>
            {t(`profile.sections.${current}`)}
          </h2>
          {current === 'documents' ? (
            <DocumentsSection
              documents={documents.data}
              reference={reference}
              onChange={documents.setData}
            />
          ) : (
            <Section
              key={current}
              profile={profile.data}
              reference={reference}
              onSaved={profile.setData}
            />
          )}
        </section>
      </div>
    </div>
  );
}
