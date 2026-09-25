import { listDocuments } from '../../../api/documents';
import { getProfile } from '../../../api/profile';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { CandidateTabs } from '../../../components/layout/CandidateTabs';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { DocumentsSection } from './DocumentsSection';
import { EducationSection } from './EducationSection';
import { ExperienceSection } from './ExperienceSection';
import { ProfileForm } from './ProfileForm';

/**
 * My profile (design: Malaika): the one-page form, then the education, experience and document
 * details that jobs with minimum marks, experience or specific documents need.
 */
export default function ProfilePage() {
  useDocumentTitle(t('profileForm.title'));
  const profile = useAsync(getProfile, []);
  const documents = useAsync(listDocuments, []);
  const { data: reference, error: referenceError } = useReferenceData();

  const error = profile.error ?? documents.error ?? referenceError;
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
  if (!profile.data || !documents.data || !reference) return <LoadingState />;

  const card = 'flex flex-col gap-4 rounded-md border border-heritage bg-white p-6 md:p-8';

  return (
    <div className="bg-cream py-8">
      <div className="page flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm">{t('profileForm.eyebrow')}</p>
            <h1 className="text-2xl text-black md:text-3xl">{t('profileForm.title')}</h1>
            <p className="mt-0.5 text-sm">{t('profileForm.lead')}</p>
          </div>
          <CandidateTabs current="profile" />
        </div>

        <ProfileForm
          profile={profile.data}
          reference={reference}
          documents={documents.data}
          onSaved={profile.setData}
          onDocumentsChange={documents.setData}
        />

        <div className="flex flex-col gap-2">
          <h2 className="text-xl text-black">{t('profileForm.detailsTitle')}</h2>
          <p className="text-sm">{t('profileForm.detailsLead')}</p>
        </div>
        <section id="education" className={card}>
          <h3 className="text-base text-black">{t('profileForm.education')}</h3>
          <EducationSection
            profile={profile.data}
            reference={reference}
            onSaved={profile.setData}
          />
        </section>
        <section id="experience" className={card}>
          <h3 className="text-base text-black">{t('profileForm.experience')}</h3>
          <ExperienceSection
            profile={profile.data}
            reference={reference}
            onSaved={profile.setData}
          />
        </section>
        <section id="documents" className={card}>
          <h3 className="text-base text-black">{t('profileForm.documents')}</h3>
          <DocumentsSection
            documents={documents.data}
            reference={reference}
            onChange={documents.setData}
          />
        </section>
      </div>
    </div>
  );
}
