import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getApplicationCheck, submitApplication } from '../../../api/applications';
import { listDocuments } from '../../../api/documents';
import { getJob } from '../../../api/jobs';
import { getProfile } from '../../../api/profile';
import { Alert } from '../../../components/common/Alert';
import { ApplySteps } from '../../../components/common/ApplySteps';
import { Button } from '../../../components/common/Button';
import { JobSummary } from '../../../components/common/JobSummary';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { CheckboxField } from '../../../components/forms/CheckboxField';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { errorMessage } from '../../../utils/errorMessage';
import { formatCurrency, formatDate } from '../../../utils/format';
import {
  documentName,
  genderName,
  provinceName,
  qualificationName,
} from '../../../utils/referenceLabels';
import { ReviewSection } from './ReviewSection';

async function loadAll(jobId) {
  const [job, check, profile, documents] = await Promise.all([
    getJob(jobId),
    getApplicationCheck(jobId),
    getProfile(),
    listDocuments(),
  ]);
  return { job, check, profile, documents };
}

export default function ApplicationReviewPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  useDocumentTitle(t('review.title'));
  const { data, error, reload } = useAsync(() => loadAll(jobId), [jobId]);
  const { data: ref } = useReferenceData();
  const [confirmed, setConfirmed] = useState({ eligibility: false, declaration: false });
  const [submitError, setSubmitError] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);

  if (error) {
    return (
      <div className="page">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (!data) return <LoadingState />;

  const { job, check, profile, documents } = data;
  // Only complete, eligible, not-yet-submitted applications can be reviewed.
  if (!check.complete || !check.eligible || check.alreadyAppliedId || check.jobClosed) {
    return <Navigate to={paths.applyCheck(jobId)} replace />;
  }

  const editLink = (section) =>
    `${paths.profileSection(section)}&returnTo=${encodeURIComponent(paths.applyReview(jobId))}`;
  const { personal, contact, domicile } = profile;
  const jobDocuments = job.requirements.documents.map((type) =>
    documents.find((d) => d.type === type),
  );

  async function submit() {
    if (!confirmed.eligibility || !confirmed.declaration) {
      setShowErrors(true);
      return;
    }
    setBusy(true);
    setSubmitError(null);
    try {
      const application = await submitApplication(jobId, { declarationAccepted: true });
      navigate(`${paths.application(application.id)}?submitted=1`, { replace: true });
    } catch (err) {
      setSubmitError(err);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-215 flex-col gap-5 px-4 pt-8">
      <ApplySteps current="review" />
      <div>
        <h1 className="text-2xl">{t('review.title')}</h1>
        <p>{t('review.lead')}</p>
      </div>
      <div className="rounded-md bg-cream p-4">
        <JobSummary job={job} />
      </div>

      <ReviewSection
        title={t('profile.sections.personal')}
        editTo={editLink('personal')}
        rows={[
          { label: t('fields.fullName'), value: personal.fullName },
          { label: t('fields.fatherName'), value: personal.fatherName },
          { label: t('fields.cnic'), value: personal.cnic },
          { label: t('fields.dob'), value: formatDate(personal.dob) },
          { label: t('fields.gender'), value: genderName(ref, personal.gender) },
        ]}
      />
      <ReviewSection
        title={t('profile.sections.contact')}
        editTo={editLink('contact')}
        rows={[
          { label: t('fields.mobile'), value: contact.mobile },
          { label: t('fields.email'), value: contact.email },
          { label: t('fields.currentAddress'), value: contact.currentAddress },
        ]}
      />
      <ReviewSection
        title={t('profile.sections.domicile')}
        editTo={editLink('domicile')}
        rows={[
          { label: t('fields.province'), value: provinceName(ref, domicile.province) },
          { label: t('fields.district'), value: domicile.district },
        ]}
      />
      <ReviewSection title={t('profile.sections.education')} editTo={editLink('education')}>
        <ul className="grid list-disc gap-2 pl-5">
          {profile.education.map((e) => (
            <li key={e.id}>
              <strong>{qualificationName(ref, e.level)}</strong> · {e.discipline} ·{' '}
              {t('profile.education.summary', {
                institution: e.institution,
                year: e.year,
                marks: e.marksPercent,
              })}
            </li>
          ))}
        </ul>
      </ReviewSection>
      {profile.experience.length > 0 && (
        <ReviewSection title={t('profile.sections.experience')} editTo={editLink('experience')}>
          <ul className="grid list-disc gap-2 pl-5">
            {profile.experience.map((e) => (
              <li key={e.id}>
                <strong>{e.designation}</strong> · {e.organization}
              </li>
            ))}
          </ul>
        </ReviewSection>
      )}
      <ReviewSection title={t('review.documentsTitle')} editTo={editLink('documents')}>
        <ul className="grid list-disc gap-2 pl-5">
          {job.requirements.documents.map((type, i) => (
            <li key={type}>
              <strong>{documentName(ref, type)}</strong> · {jobDocuments[i]?.fileName}
            </li>
          ))}
        </ul>
      </ReviewSection>

      <section
        className="flex flex-col gap-4 rounded-md border-2 border-heritage bg-surface p-5"
        aria-labelledby="declaration-title"
      >
        <h2 id="declaration-title" className="text-lg">
          {t('review.declarationTitle')}
        </h2>
        {job.fee > 0 && (
          <p className="font-bold [&>span]:font-normal">
            {t('review.fee', { amount: formatCurrency(job.fee) })}
            <span> {t('review.feeNote')}</span>
          </p>
        )}
        <CheckboxField
          label={t('review.confirmEligibility')}
          checked={confirmed.eligibility}
          onChange={(e) => setConfirmed((c) => ({ ...c, eligibility: e.target.checked }))}
          error={showErrors && !confirmed.eligibility ? t('validation.confirmRequired') : null}
        />
        <CheckboxField
          label={t('review.confirmDeclaration')}
          checked={confirmed.declaration}
          onChange={(e) => setConfirmed((c) => ({ ...c, declaration: e.target.checked }))}
          error={showErrors && !confirmed.declaration ? t('validation.confirmRequired') : null}
        />
        <Alert variant="warning" title={t('review.finalTitle')}>
          {t('review.finalBody')}
        </Alert>
        {submitError && <Alert variant="error">{errorMessage(submitError)}</Alert>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button to={paths.applyCheck(jobId)} variant="ghost">
            {t('review.back')}
          </Button>
          <Button variant="accent" size="lg" onClick={submit} loading={busy}>
            {t('review.submit')}
          </Button>
        </div>
      </section>
    </div>
  );
}
