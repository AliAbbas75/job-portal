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
      <div className="page">
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
    <div className="page flex flex-col gap-5 pt-8">
      <header className="flex flex-wrap items-end justify-between gap-4 [&_h1]:text-2xl">
        <div>
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.lead')}</p>
        </div>
        <div className="flex flex-[0_1_280px] flex-col gap-2">
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

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
        <nav className="min-w-0" aria-label={t('profile.sectionsLabel')}>
          <ul className="flex flex-col rounded-md border border-heritage max-md:flex-row max-md:overflow-x-auto [&>li+li]:border-dashed [&>li+li]:border-heritage max-md:[&>li+li]:border-l md:[&>li+li]:border-t">
            {SECTIONS.map((section) => {
              const done = section.isComplete(profile.data, documents.data);
              return (
                <li key={section.id}>
                  <Link
                    to={sectionLink(section.id)}
                    className={`flex items-center gap-3 border-transparent px-4 py-3 text-black no-underline hover:bg-surface max-md:border-b-4 max-md:whitespace-nowrap md:border-l-4 ${current === section.id ? 'border-gold! bg-surface font-bold text-heritage!' : ''}`}
                    aria-current={current === section.id ? 'page' : undefined}
                  >
                    <span
                      className={`grid size-5.5 flex-none place-items-center rounded-full border-2 border-heritage ${done ? 'bg-heritage text-white' : ''}`}
                    >
                      {done && <Icon name="check" size={14} />}
                    </span>
                    <span>
                      {t(`profile.sections.${section.id}`)}
                      {!section.required && (
                        <span className="text-xs font-normal"> {t('fields.optionalTag')}</span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <section
          className="flex min-w-0 flex-col gap-4 rounded-md border border-heritage p-4 md:p-5"
          aria-labelledby="section-title"
        >
          <h2 id="section-title" className="text-xl">
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
