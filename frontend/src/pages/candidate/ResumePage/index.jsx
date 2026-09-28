import { useState } from 'react';
import { getProfile } from '../../../api/profile';
import { downloadResumePdf } from '../../../api/resume';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { errorMessage } from '../../../utils/errorMessage';
import { EducationSection } from '../ProfilePage/EducationSection';
import { ExperienceSection } from '../ProfilePage/ExperienceSection';
import { PublicationsSection } from '../ProfilePage/PublicationsSection';
import { ReferencesSection } from '../ProfilePage/ReferencesSection';
import { RegistrationsSection } from '../ProfilePage/RegistrationsSection';
import { SkillsSection } from '../ProfilePage/SkillsSection';
import { StatementSection } from '../ProfilePage/StatementSection';
import { DetailsReview } from './DetailsReview';
import { ResumeUpload } from './ResumeUpload';

const SECTIONS = [
  { key: 'education', Section: EducationSection },
  { key: 'experience', Section: ExperienceSection },
  { key: 'skills', Section: SkillsSection },
  { key: 'registrations', Section: RegistrationsSection },
  { key: 'publications', Section: PublicationsSection },
  { key: 'references', Section: ReferencesSection },
];

/**
 * M5 resume (BPS-15+ jobs): upload a resume and confirm what was read (T-054), or build it section
 * by section and download it as a PDF (T-055). Everything saves to the one profile.
 */
export default function ResumePage() {
  useDocumentTitle(t('resume.title'));
  const profile = useAsync(getProfile, []);
  const { data: reference, error: referenceError } = useReferenceData();
  const [parse, setParse] = useState(null);
  // Remounts the sections for each upload, so earlier suggestions don't linger.
  const [uploads, setUploads] = useState(0);
  const [pdf, setPdf] = useState({ busy: false, error: null, unavailable: false });

  const error = profile.error ?? referenceError;
  if (error) {
    return (
      <div className="page">
        <ErrorState error={error} onRetry={profile.reload} />
      </div>
    );
  }
  if (!profile.data || !reference) return <LoadingState />;

  const suggestions = parse?.parsed ? parse.sections : null;
  const lowConfidence = parse?.lowConfidence ?? 0;
  const common = { profile: profile.data, reference, onSaved: profile.setData, lowConfidence };
  const card = 'flex flex-col gap-4 rounded-md border border-heritage bg-white p-6 md:p-8';

  async function download() {
    setPdf({ busy: true, error: null, unavailable: false });
    try {
      const blob = await downloadResumePdf();
      if (!blob) {
        setPdf({ busy: false, error: null, unavailable: true });
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'resume.pdf';
      link.click();
      URL.revokeObjectURL(url);
      setPdf({ busy: false, error: null, unavailable: false });
    } catch (err) {
      setPdf({ busy: false, error: errorMessage(err), unavailable: false });
    }
  }

  return (
    <div className="bg-cream py-8">
      <div className="page flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Button to={paths.profile} variant="ghost" size="sm">
              <Icon name="arrowLeft" size={16} />
              {t('resume.backToProfile')}
            </Button>
            <h1 className="text-2xl text-black md:text-3xl">{t('resume.title')}</h1>
            <p className="mt-0.5 text-sm">{t('resume.lead')}</p>
          </div>
          <Button onClick={download} loading={pdf.busy}>
            <Icon name="file" size={16} />
            {t('resume.downloadPdf')}
          </Button>
        </div>
        {pdf.error && <Alert variant="error">{pdf.error}</Alert>}
        {pdf.unavailable && <Alert variant="info">{t('resume.pdfUnavailable')}</Alert>}

        <section id="upload" className={card}>
          <h2 className="text-lg text-black">{t('resume.upload.title')}</h2>
          <ResumeUpload
            result={parse}
            onParsed={(result) => {
              setParse(result);
              setUploads((n) => n + 1);
            }}
          />
        </section>

        {suggestions && (
          <section id="details" className={card}>
            <h2 className="text-lg text-black">{t('resume.details.title')}</h2>
            <DetailsReview key={uploads} suggestions={suggestions} {...common} />
          </section>
        )}

        <div className="flex flex-col gap-2">
          <h2 className="text-xl text-black">{t('resume.builderTitle')}</h2>
          <p className="text-sm">{t('resume.builderLead')}</p>
        </div>

        <section id="statement" className={card}>
          <h3 className="text-base text-black">{t('resume.statement.title')}</h3>
          <StatementSection
            key={uploads}
            suggestion={suggestions?.statementOfPurpose}
            {...common}
          />
        </section>
        {SECTIONS.map(({ key, Section }) => (
          <section key={key} id={key} className={card}>
            <h3 className="text-base text-black">{t(`resume.sections.${key}`)}</h3>
            <Section key={uploads} suggestions={suggestions?.[key]} {...common} />
          </section>
        ))}
      </div>
    </div>
  );
}
