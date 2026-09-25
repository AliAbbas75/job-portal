import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getApplicationCheck,
  requestApplyCode,
  submitApplication,
  verifyApplyCode,
} from '../../../api/applications';
import { listDocuments } from '../../../api/documents';
import { getJob } from '../../../api/jobs';
import { getProfile, updateProfile } from '../../../api/profile';
import { Alert } from '../../../components/common/Alert';
import { ApplySteps } from '../../../components/common/ApplySteps';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { OtpStep } from '../../../components/forms/OtpStep';
import { ProfileFields } from '../../../components/forms/ProfileFields';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { errorMessage } from '../../../utils/errorMessage';
import {
  errorsFromApi,
  formFromProfile,
  payloadFromForm,
  validateProfileForm,
} from '../../../utils/profileForm';
import { DocumentsStep } from './DocumentsStep';
import { IdentityStep } from './IdentityStep';
import { ReviewStep } from './ReviewStep';

/**
 * Apply wizard (design: Malaika / Figma): 1 identity, 2 SMS code, 3 profile, 4 documents,
 * 5 review, 6 confirmation. Profile details and documents are saved to the permanent profile;
 * submitting freezes them in the application.
 */
export default function ApplicationCheckPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  useDocumentTitle(t('wizard.title'));
  const job = useAsync(() => getJob(jobId), [jobId]);
  const profile = useAsync(getProfile, []);
  const documents = useAsync(listDocuments, []);
  const check = useAsync(() => getApplicationCheck(jobId), [jobId]);
  const { data: reference } = useReferenceData();

  const [step, setStep] = useState('identity');
  const [identity, setIdentity] = useState(null);
  const [applyPass, setApplyPass] = useState(null);
  const [form, setForm] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const loadError = job.error ?? profile.error ?? documents.error ?? check.error;
  if (loadError) {
    return (
      <div className="page">
        <ErrorState error={loadError} onRetry={() => navigate(0)} />
      </div>
    );
  }
  if (!job.data || !profile.data || !documents.data || !check.data || !reference) {
    return <LoadingState />;
  }
  if (form === null) setForm(formFromProfile(profile.data));

  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const sendCode = (values) =>
    run(async () => {
      await requestApplyCode(jobId, values);
      setIdentity(values);
      setStep('otp');
    });

  async function verifyCode(otp) {
    const { applyPass: pass } = await verifyApplyCode(jobId, otp);
    setApplyPass(pass);
    setStep('profile');
  }

  function saveProfile() {
    const found = validateProfileForm(form);
    setFormErrors(found);
    if (Object.keys(found).length) {
      setError(errorMessage({ code: 'validation_error' }));
      return;
    }
    run(async () => {
      try {
        profile.setData(await updateProfile(payloadFromForm(form)));
      } catch (err) {
        setFormErrors(errorsFromApi(err.fields));
        throw err;
      }
      setStep('documents');
    });
  }

  const goToReview = () =>
    run(async () => {
      check.setData(await getApplicationCheck(jobId));
      setStep('review');
    });

  const submit = () =>
    run(async () => {
      setSubmitted(await submitApplication(jobId, { declarationAccepted: true, applyPass }));
      setStep('confirm');
    });

  const back = (to) => () => {
    setError(null);
    setStep(to);
  };

  const title = `${job.data.title} - ${t('jobs.bps', { bps: job.data.bps })}`;
  const blocked = check.data.alreadyAppliedId || check.data.jobClosed;
  const nav = (onBack, onContinue, label = t('wizard.continue')) => (
    <div className="flex items-center justify-between gap-3 border-t border-surface pt-4">
      <Button variant="secondary" onClick={onBack}>
        {t('wizard.back')}
      </Button>
      <Button loading={busy} onClick={onContinue}>
        {label}
      </Button>
    </div>
  );

  return (
    <div className="bg-cream py-8">
      <div className="page max-w-3xl">
        <div className="flex flex-col gap-6 rounded-lg border border-heritage bg-white p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 rounded-md border border-surface bg-cream p-4">
            <div>
              <p className="text-sm">{t('wizard.applyingFor')}</p>
              <h2 className="text-base text-black">{title}</h2>
            </div>
            <Link to={paths.job(jobId)} className="text-sm font-bold">
              {t('wizard.viewDetails')}
            </Link>
          </div>

          <ApplySteps current={step} />

          {blocked && step !== 'confirm' ? (
            <Alert
              variant="info"
              title={
                check.data.alreadyAppliedId
                  ? t('wizard.alreadyAppliedTitle')
                  : t('wizard.closedTitle')
              }
              action={
                check.data.alreadyAppliedId && (
                  <Button to={paths.application(check.data.alreadyAppliedId)} size="sm">
                    {t('wizard.viewApplication')}
                  </Button>
                )
              }
            />
          ) : (
            <>
              {error && step !== 'otp' && <Alert variant="error">{error}</Alert>}

              {step === 'identity' && (
                <IdentityStep
                  initial={{ cnic: profile.data.personal.cnic, mobile: '' }}
                  busy={busy}
                  onBack={() => navigate(paths.job(jobId))}
                  onContinue={sendCode}
                />
              )}

              {step === 'otp' && (
                <OtpStep
                  mobile={identity.mobile}
                  title={t('wizard.otpTitle')}
                  lead={t('wizard.otpLead', { mobile: identity.mobile })}
                  onVerify={verifyCode}
                  onResend={() => requestApplyCode(jobId, identity)}
                  onBack={back('identity')}
                />
              )}

              {step === 'profile' && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h1 className="text-xl text-black">{t('wizard.profileTitle')}</h1>
                    <p className="text-sm">{t('wizard.profileLead')}</p>
                  </div>
                  <ProfileFields
                    form={form}
                    setForm={setForm}
                    errors={formErrors}
                    reference={reference}
                  />
                  {nav(back('identity'), saveProfile)}
                </div>
              )}

              {step === 'documents' && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h1 className="text-xl text-black">{t('wizard.documentsTitle')}</h1>
                    <p className="text-sm">{t('wizard.documentsLead')}</p>
                  </div>
                  <DocumentsStep
                    check={check.data}
                    claims={profile.data.claims}
                    documents={documents.data}
                    reference={reference}
                    onChange={documents.setData}
                  />
                  {nav(back('profile'), goToReview)}
                </div>
              )}

              {step === 'review' && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h1 className="text-xl text-black">{t('wizard.reviewTitle')}</h1>
                    <p className="text-sm">{t('wizard.reviewLead')}</p>
                  </div>
                  <ReviewStep
                    identity={identity}
                    profile={profile.data}
                    documents={documents.data}
                    check={check.data}
                    reference={reference}
                  />
                  <div className="flex items-center justify-between gap-3 border-t border-surface pt-4">
                    <Button variant="secondary" onClick={back('documents')}>
                      {t('wizard.back')}
                    </Button>
                    <Button
                      loading={busy}
                      disabled={!check.data.complete || !check.data.eligible}
                      onClick={submit}
                    >
                      {t('wizard.submit')}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'confirm' && submitted && (
                <div className="flex flex-col items-center gap-5 py-8 text-center">
                  <span className="flex size-16 items-center justify-center rounded-full border border-heritage bg-surface text-heritage">
                    <Icon name="check" size={32} />
                  </span>
                  <div>
                    <h1 className="text-2xl text-black">{t('wizard.submittedTitle')}</h1>
                    <p className="mx-auto mt-2 max-w-sm text-sm">
                      {t('wizard.submittedBody', { job: job.data.title })}
                    </p>
                    <p className="font-mono mt-2 text-sm font-bold">
                      {t('wizard.reference', { id: submitted.id })}
                    </p>
                  </div>
                  <Button size="lg" onClick={() => navigate(paths.applications)}>
                    {t('wizard.toDashboard')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
