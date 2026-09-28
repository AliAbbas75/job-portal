import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { changePassword } from '../../api/adminAuth';
import { createRequisition, listAdminJobs } from '../../api/adminJobs';
import {
  getOrganization,
  getOrganizationLogo,
  updateOrganization,
  uploadOrganizationLogo,
} from '../../api/adminOrganization';
import { JobStatusBadge } from '../../components/common/JobStatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { useDismiss } from '../../hooks/useDismiss';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useReferenceData } from '../../hooks/useReferenceData';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import { paths } from '../../routes/paths';
import { errorMessage } from '../../utils/errorMessage';

// Create-job quota checkboxes → the backend's quota selection codes.
const QUOTA_CODES = {
  openMerit: 'open_merit',
  employeeChild: 'railway_employee_child',
  women: 'women',
  minorities: 'minority',
  disabled: 'disability',
  punjab: 'punjab',
  sindh: 'sindh',
  kpk: 'khyber_pakhtunkhwa',
  balochistan: 'balochistan',
};
const ORGANIZATION_FIELDS = [
  'departmentName',
  'cellId',
  'address',
  'website',
  'officerName',
  'email',
  'phone',
  'policyNotes',
];
const BAR_COLORS = ['bg-heritage', 'bg-heritage', 'bg-pumpkin', 'bg-gold', 'bg-purple-600'];

export default function AdminHomePage() {
  useDocumentTitle('Employer Admin Panel');
  const { staff, signOut } = useStaffAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Avatar Image Upload state
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Editable Employer Profile Form State
  const [employerProfile, setEmployerProfile] = useState({
    departmentName: 'Pakistan Railways Headquarters',
    cellId: 'PR-HQ-LHR-2026',
    address: 'Empress Road, Lahore, Punjab',
    website: 'https://pakrail.gov.pk',
    officerName: 'Muhammad Raza Hussain (DPO)',
    email: 'info@pakrail.gov.pk',
    phone: '042-99201938',
    policyNotes:
      'All BPS-01 to BPS-15 job requisitions enforce official Pakistan Railways quota distribution rules (Open Merit, Railway Employee Child, Women, Minorities, Disabled).',
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Reset password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  const profileMenuRef = useRef(null);
  const resetDialogRef = useRef(null);
  // Both close on a click outside them or Escape (the dialog stays open while saving).
  useDismiss(profileMenuRef, profileDropdownOpen, () => setProfileDropdownOpen(false));
  useDismiss(resetDialogRef, resetModalOpen, () => !resetBusy && setResetModalOpen(false));

  const [chosenStatus] = useState(''); // status filter isn't wired to a control yet

  // Create Job Form State with Quotas & KPIs
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'CIV',
    bps: '5',
    vacancies: '10',
    closingDate: '2026-11-30',
    description: '',
    quotas: {
      openMerit: true,
      employeeChild: true,
      women: true,
      minorities: true,
      disabled: false,
      punjab: true,
      sindh: false,
      kpk: false,
      balochistan: false,
    },
    kpis: [
      { id: 1, title: 'Screening Test Pass Threshold', target: '60% Marks' },
      { id: 2, title: 'Application Scrutiny Turnaround', target: '14 Days' },
    ],
  });

  const [newKpiTitle, setNewKpiTitle] = useState('');
  const [newKpiTarget, setNewKpiTarget] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [createError, setCreateError] = useState(null);

  const jobsQuery = useAsync(() => listAdminJobs({ status: chosenStatus }), [chosenStatus]);
  const { data: reference } = useReferenceData();

  // Load the saved organisation profile and logo.
  useEffect(() => {
    let cancelled = false;
    let logoUrl = null;
    getOrganization()
      .then(async (profile) => {
        if (cancelled) return;
        setEmployerProfile((current) => ({
          ...current,
          ...Object.fromEntries(ORGANIZATION_FIELDS.map((key) => [key, profile[key] ?? ''])),
        }));
        if (profile.hasLogo) {
          const blob = await getOrganizationLogo();
          if (blob && !cancelled) {
            logoUrl = URL.createObjectURL(blob);
            setAvatarPreview(logoUrl);
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    if (signOut) await signOut();
    navigate(paths.adminLogin);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setProfileError(null);
    try {
      await uploadOrganizationLogo(file);
      setAvatarPreview(URL.createObjectURL(file));
    } catch (err) {
      setProfileError(errorMessage(err));
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError(null);
    try {
      await updateOrganization(
        Object.fromEntries(ORGANIZATION_FIELDS.map((key) => [key, employerProfile[key]])),
      );
      setProfileSaved(true);
      setTimeout(() => {
        setProfileSaved(false);
      }, 2500);
    } catch (err) {
      setProfileError(errorMessage(err));
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);

    if (!newPassword || newPassword.length < 12) {
      setResetError('Password must be at least 12 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetBusy(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setResetSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setResetModalOpen(false);
        setResetSuccess(false);
      }, 1500);
    } catch (err) {
      setResetError(errorMessage(err));
    } finally {
      setResetBusy(false);
    }
  };

  const toggleQuota = (key) => {
    setJobForm((prev) => ({
      ...prev,
      quotas: {
        ...prev.quotas,
        [key]: !prev.quotas[key],
      },
    }));
  };

  const handleAddKpi = (e) => {
    e.preventDefault();
    if (!newKpiTitle.trim()) return;
    setJobForm((prev) => ({
      ...prev,
      kpis: [...prev.kpis, { id: Date.now(), title: newKpiTitle, target: newKpiTarget || 'N/A' }],
    }));
    setNewKpiTitle('');
    setNewKpiTarget('');
  };

  const handleRemoveKpi = (id) => {
    setJobForm((prev) => ({
      ...prev,
      kpis: prev.kpis.filter((k) => k.id !== id),
    }));
  };

  // Saves the requisition as a draft, then opens the full job form to complete it (location,
  // dates, eligibility, quota seats) before it goes for approval.
  const handleCreateJobSubmit = async (e) => {
    e.preventDefault();
    setCreateError(null);
    try {
      const job = await createRequisition({
        title: jobForm.title.trim(),
        department: jobForm.department,
        bps: Number(jobForm.bps),
        vacancies: Number(jobForm.vacancies),
        closingDate: jobForm.closingDate || null,
        description: jobForm.description.trim() || null,
        quotaSelection: Object.keys(QUOTA_CODES)
          .filter((key) => jobForm.quotas[key])
          .map((key) => QUOTA_CODES[key]),
        kpis: jobForm.kpis.map(({ title, target }) => ({ title, target })),
      });
      setFormSubmitted(true);
      setTimeout(() => navigate(paths.adminEditJob(job.id)), 1200);
    } catch (err) {
      setCreateError(errorMessage(err));
    }
  };

  const jobsList = jobsQuery.data?.items ?? [];
  const totalApplicants = jobsList.reduce((sum, job) => sum + (job.applicantsCount ?? 0), 0);
  const totalVacancies = jobsList.reduce((sum, job) => sum + (job.vacancies ?? 0), 0);
  const maxApplicants = Math.max(1, ...jobsList.map((job) => job.applicantsCount ?? 0));
  const applicantBars = [...jobsList]
    .sort((a, b) => (b.applicantsCount ?? 0) - (a.applicantsCount ?? 0))
    .slice(0, 10)
    .map((job, index) => ({
      job: `${job.title} (BPS-${job.bps})`,
      count: job.applicantsCount ?? 0,
      percent: `${Math.round(((job.applicantsCount ?? 0) / maxApplicants) * 100)}%`,
      color: BAR_COLORS[index % BAR_COLORS.length],
    }));

  return (
    <div className="flex min-h-screen flex-col bg-cream font-['Instrument_Sans',sans-serif] text-black">
      {/* Top Header - Just Circle Profile Pic Icon with Dropdown on Top Right (No text behind/beside it) */}
      <header className="shadow-md sticky top-0 z-30 flex items-center justify-between bg-heritage px-8 py-3 text-white">
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 font-bold text-white">
            <svg
              className="h-5 w-5 text-surface"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base leading-tight font-bold tracking-tight text-white">
              Pakistan Railways
            </h1>
            <p className="text-[11px] font-medium text-surface">Employer Admin Panel</p>
          </div>
        </div>

        {/* ONLY Circle Profile Pic Icon (No label behind or beside it) */}
        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            aria-label="Admin Profile Menu"
            className="shadow-xs flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-heritage p-0 text-xs font-extrabold text-white transition-all hover:scale-105"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Admin Profile"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              (staff?.name || staff?.username || 'A').charAt(0).toUpperCase()
            )}
          </button>

          {profileDropdownOpen && (
            <div className="shadow-2xl animate-in fade-in absolute right-0 z-50 mt-2 w-56 rounded-xl border border-surface bg-white py-2 text-black duration-150">
              <div className="rounded-t-xl border-b border-surface bg-cream px-4 py-2">
                <p className="text-xs font-bold text-black">{staff?.name || 'Admin Officer'}</p>
                <p className="mt-0.5 text-[11px] font-medium text-black">
                  {staff?.email || 'admin@pakrail.gov.pk'}
                </p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setResetModalOpen(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-4 py-2.5 text-left text-xs font-semibold text-black transition-colors hover:bg-surface"
                >
                  <svg
                    className="h-4 w-4 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  Reset Password
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-4 py-2.5 text-left text-xs font-bold text-ember transition-colors hover:bg-cream"
                >
                  <svg
                    className="h-4 w-4 text-ember"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Interactive Reset Password Modal */}
      {resetModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
          <div
            ref={resetDialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Reset Admin Password"
            className="shadow-2xl w-full max-w-md space-y-5 rounded-2xl border border-surface bg-white p-6"
          >
            <div className="flex items-center justify-between border-b border-surface pb-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-black">
                <svg
                  className="h-5 w-5 text-heritage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                Reset Admin Password
              </h3>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="cursor-pointer border-none bg-transparent text-lg font-bold text-black hover:text-heritage"
              >
                ✕
              </button>
            </div>

            {resetSuccess ? (
              <div className="rounded-xl border border-heritage bg-surface p-4 text-center text-xs font-semibold text-heritage">
                ✓ Password reset successfully!
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
                {resetError && (
                  <div className="rounded-lg border border-ember bg-white p-3 font-medium text-ember">
                    {resetError}
                  </div>
                )}

                <div>
                  <label className="mb-1 block font-semibold text-black">Current Password *</label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-black">New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-black">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="cursor-pointer rounded-lg border border-heritage bg-white px-4 py-2 font-semibold text-black hover:bg-cream"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetBusy}
                    className="cursor-pointer rounded-lg border-none bg-heritage px-5 py-2 font-bold text-white hover:bg-black"
                  >
                    {resetBusy ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Container with Fixed Side Panel */}
      <div className="relative flex min-h-[calc(100vh-57px)] flex-1">
        {/* Fixed Heritage Green Side Panel */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-64 flex-shrink-0 space-y-6 overflow-y-auto border-r border-white/20 bg-heritage p-5 text-white md:flex md:flex-col">
          <div className="px-1 pt-1">
            <p className="text-[10px] font-bold tracking-wider text-surface uppercase">
              Employer Controls
            </p>
          </div>

          <nav className="flex-1 space-y-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3.5 py-3 text-left transition-all ${
                activeTab === 'overview'
                  ? 'shadow-sm bg-white font-bold text-heritage'
                  : 'text-surface hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Dashboard Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3.5 py-3 text-left transition-all ${
                activeTab === 'profile'
                  ? 'shadow-sm bg-white font-bold text-heritage'
                  : 'text-surface hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4"
                />
              </svg>
              Employer Profile
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3.5 py-3 text-left transition-all ${
                activeTab === 'pending'
                  ? 'shadow-sm bg-white font-bold text-heritage'
                  : 'text-surface hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Pending Jobs ({jobsList.filter((j) => j.status === 'pending_approval').length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('published')}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3.5 py-3 text-left transition-all ${
                activeTab === 'published'
                  ? 'shadow-sm bg-white font-bold text-heritage'
                  : 'text-surface hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Published Jobs
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3.5 py-3 text-left transition-all ${
                activeTab === 'create'
                  ? 'shadow-sm bg-white font-bold text-heritage'
                  : 'text-surface hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg
                className="h-4 w-4 text-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create a Job
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('graphs')}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3.5 py-3 text-left transition-all ${
                activeTab === 'graphs'
                  ? 'shadow-sm bg-white font-bold text-heritage'
                  : 'text-surface hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Applicants per Job Graphs
            </button>
          </nav>

          {/* Clean Side Footer Info */}
          <div className="space-y-2 rounded-xl border border-white/20 bg-black/20 p-4 text-xs">
            <p className="font-semibold text-surface">Recruitment Summary</p>
            <div className="flex justify-between text-[11px] text-surface">
              <span>Active Requisitions</span>
              <strong className="text-white">{jobsList.length}</strong>
            </div>
            <div className="flex justify-between text-[11px] text-surface">
              <span>Total Applicants</span>
              <strong className="text-white">{totalApplicants}</strong>
            </div>
          </div>
        </aside>

        {/* Main Dashboard Content Area */}
        <main className="max-w-7xl flex-1 space-y-8 overflow-y-auto p-6 lg:p-8">
          {/* TAB 1: OVERVIEW DASHBOARD & PUBLISHED JOBS */}
          {(activeTab === 'overview' || activeTab === 'published') && (
            <div className="space-y-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="shadow-xs flex items-center justify-between rounded-2xl border border-surface bg-white p-5">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-black">Employer Active Jobs</p>
                    <p className="text-3xl font-extrabold text-black">{jobsList.length}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-surface bg-surface text-heritage">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="shadow-xs flex items-center justify-between rounded-2xl border border-surface bg-white p-5">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-black">Pending Approvals</p>
                    <p className="text-3xl font-extrabold text-black">
                      {jobsList.filter((j) => j.status === 'pending_approval').length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold bg-cream text-pumpkin">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="shadow-xs flex items-center justify-between rounded-2xl border border-surface bg-white p-5">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-black">Total Applicants</p>
                    <p className="text-3xl font-extrabold text-black">{totalApplicants}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-surface bg-surface text-heritage">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="shadow-xs flex items-center justify-between rounded-2xl border border-surface bg-white p-5">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-black">Employer Vacancies</p>
                    <p className="text-3xl font-extrabold text-black">{totalVacancies}</p>
                  </div>
                  <div className="bg-purple-50 text-purple-600 border-purple-100 flex h-12 w-12 items-center justify-center rounded-xl border">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Employer Job Postings Table */}
              <div className="shadow-xs space-y-5 rounded-2xl border border-surface bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-black">
                      Employer Job Postings Management
                    </h2>
                    <p className="mt-0.5 text-xs text-black">
                      Track and manage active recruitment requisitions for Pakistan Railways.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="shadow-xs flex cursor-pointer items-center gap-2 rounded-xl border-none bg-heritage px-4 py-2.5 text-xs font-semibold text-white hover:bg-black"
                  >
                    <svg
                      className="h-4 w-4 text-surface"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Job
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-black">
                    <thead>
                      <tr className="border-b border-surface text-[11px] font-semibold tracking-wider text-black uppercase">
                        <th className="px-3 py-3">Employer Position Title</th>
                        <th className="px-3 py-3">Department</th>
                        <th className="px-3 py-3">BPS Scale</th>
                        <th className="px-3 py-3">Vacancies</th>
                        <th className="px-3 py-3">Applicants</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface">
                      {jobsList.map((job) => (
                        <tr key={job.id} className="transition-colors hover:bg-cream">
                          <td className="px-3 py-3.5 font-bold text-black">
                            <Link
                              to={paths.adminJob(job.id)}
                              className="text-black no-underline hover:text-heritage"
                            >
                              {job.title}
                            </Link>
                          </td>
                          <td className="px-3 py-3.5 text-black">{job.departmentName}</td>
                          <td className="px-3 py-3.5 font-semibold">BPS - {job.bps}</td>
                          <td className="px-3 py-3.5 font-bold text-black">{job.vacancies}</td>
                          <td className="px-3 py-3.5 font-bold text-heritage">
                            {job.applicantsCount}
                          </td>
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <JobStatusBadge status={job.status} />
                          </td>
                          <td className="px-3 py-3.5 text-right whitespace-nowrap">
                            <Link
                              to={`/admin/jobs/${job.id}/applications`}
                              className="inline-block rounded-lg border border-heritage bg-surface px-3 py-1.5 text-xs font-semibold text-heritage no-underline hover:bg-cream"
                            >
                              Manage Applicants →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULLY EDITABLE EMPLOYER PROFILE & PICTURE UPLOAD */}
          {activeTab === 'profile' && (
            <div className="shadow-xs space-y-8 rounded-2xl border border-surface bg-white p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface pb-4">
                <div>
                  <h2 className="text-xl font-bold text-black">Employer Profile Details</h2>
                  <p className="mt-0.5 text-xs text-black">
                    Edit organizational information, contact details, and upload official
                    logo/avatar.
                  </p>
                </div>

                {profileError && (
                  <div className="rounded-xl border border-ember bg-white px-4 py-2 text-xs font-semibold text-ember">
                    {profileError}
                  </div>
                )}
                {profileSaved && (
                  <div className="rounded-xl border border-heritage bg-surface px-4 py-2 text-xs font-semibold text-heritage">
                    ✓ Employer Profile updated successfully!
                  </div>
                )}
              </div>

              {/* Avatar Upload Header */}
              <div className="flex items-center gap-6 rounded-2xl border border-surface bg-cream p-5">
                <div className="shadow-md relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-heritage text-2xl font-bold text-white">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Employer Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (staff?.name || 'E').charAt(0).toUpperCase()
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-black">Employer Profile Picture / Logo</h3>
                  <div className="flex items-center gap-3">
                    <label className="shadow-xs cursor-pointer rounded-lg bg-heritage px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-black">
                      Upload New Picture
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-black">Allowed formats: JPG or PNG (Max 5MB)</p>
                </div>
              </div>

              {/* Editable Profile Form */}
              <form onSubmit={handleProfileSave} className="space-y-6 text-xs">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Organization Info */}
                  <div className="space-y-4 rounded-xl border border-surface p-5">
                    <h3 className="border-b border-surface pb-2 text-sm font-bold text-black">
                      Organization Information
                    </h3>

                    <div>
                      <label className="mb-1 block font-semibold text-black">
                        Department / Organization Name
                      </label>
                      <input
                        type="text"
                        required
                        value={employerProfile.departmentName}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, departmentName: e.target.value })
                        }
                        className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-black">
                        Recruitment Cell ID
                      </label>
                      <input
                        type="text"
                        required
                        value={employerProfile.cellId}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, cellId: e.target.value })
                        }
                        className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-black">
                        Headquarters Address
                      </label>
                      <input
                        type="text"
                        required
                        value={employerProfile.address}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, address: e.target.value })
                        }
                        className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-black">
                        Official Website URL
                      </label>
                      <input
                        type="url"
                        required
                        value={employerProfile.website}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, website: e.target.value })
                        }
                        className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Authority Details */}
                  <div className="space-y-4 rounded-xl border border-surface p-5">
                    <h3 className="border-b border-surface pb-2 text-sm font-bold text-black">
                      Employer Authority &amp; Contact
                    </h3>

                    <div>
                      <label className="mb-1 block font-semibold text-black">
                        Designated Officer Name
                      </label>
                      <input
                        type="text"
                        required
                        value={employerProfile.officerName}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, officerName: e.target.value })
                        }
                        className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-black">
                        Official Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={employerProfile.email}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, email: e.target.value })
                        }
                        className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-black">
                        Helpline Phone Number
                      </label>
                      <input
                        type="text"
                        required
                        value={employerProfile.phone}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, phone: e.target.value })
                        }
                        className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-black">
                    Quota Distribution Policy Notes
                  </label>
                  <textarea
                    rows={3}
                    value={employerProfile.policyNotes}
                    onChange={(e) =>
                      setEmployerProfile({ ...employerProfile, policyNotes: e.target.value })
                    }
                    className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="shadow-sm cursor-pointer rounded-xl border-none bg-heritage px-6 py-2.5 font-bold text-white hover:bg-black"
                  >
                    Save Employer Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PENDING JOBS */}
          {activeTab === 'pending' && (
            <div className="shadow-xs space-y-5 rounded-2xl border border-surface bg-white p-6">
              <div className="border-b border-surface pb-3">
                <h2 className="text-lg font-bold text-black">
                  Pending Employer Job Requisitions Inbox
                </h2>
                <p className="mt-0.5 text-xs text-black">
                  Requisitions awaiting formal approval before publishing to public portal.
                </p>
              </div>

              <div className="space-y-4">
                {jobsList
                  .filter((j) => j.status === 'pending_approval')
                  .map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gold bg-cream p-4"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-black">
                          {job.title} — BPS {job.bps}
                        </h3>
                        <p className="mt-0.5 text-xs text-black">
                          {job.departmentName} · Vacancies: {job.vacancies}
                        </p>
                      </div>
                      <Link
                        to={paths.adminJob(job.id)}
                        className="rounded-lg bg-heritage px-4 py-2 text-xs font-semibold text-white no-underline hover:bg-black"
                      >
                        Review &amp; Approve →
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: CREATE A JOB FORM WITH QUOTAS CHECKBOXES & KPIS */}
          {activeTab === 'create' && (
            <div className="shadow-xs space-y-8 rounded-2xl border border-surface bg-white p-6 lg:p-8">
              <div className="border-b border-surface pb-4">
                <h2 className="text-xl font-bold text-black">
                  Create New Employer Job Requisition
                </h2>
                <p className="mt-1 text-xs text-black">
                  Configure position parameters, statutory category quotas, and key performance
                  indicators.
                </p>
              </div>

              {formSubmitted && (
                <div className="rounded-xl border border-heritage bg-surface p-4 text-xs font-semibold text-heritage">
                  Requisition saved as a draft. Opening the full job form to add location, dates,
                  eligibility and quota seats before it goes for approval...
                </div>
              )}

              {createError && (
                <div className="rounded-xl border border-ember bg-white p-4 text-xs font-semibold text-ember">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateJobSubmit} className="space-y-8 text-xs">
                {/* 1. Basic Details */}
                <div className="space-y-4">
                  <h3 className="border-b border-surface pb-2 text-sm font-bold text-black">
                    1. Employer Position Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-black">
                        Employer Position Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Employer - Sub Engineer Electrical"
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-black">
                        Department / Wing *
                      </label>
                      <select
                        value={jobForm.department}
                        onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                        className="w-full rounded-lg border border-heritage bg-white px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                      >
                        {(reference?.departments ?? []).map((dept) => (
                          <option key={dept.code} value={dept.code}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-black">BPS Pay Scale *</label>
                      <select
                        value={jobForm.bps}
                        onChange={(e) => setJobForm({ ...jobForm, bps: e.target.value })}
                        className="w-full rounded-lg border border-heritage bg-white px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                      >
                        {Array.from({ length: 22 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1)}>
                            BPS-{i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-black">
                        Total Vacancies *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={jobForm.vacancies}
                        onChange={(e) => setJobForm({ ...jobForm, vacancies: e.target.value })}
                        className="w-full rounded-lg border border-heritage px-3.5 py-2.5 focus:ring-2 focus:ring-heritage focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Statutory Quotas Checkboxes */}
                <div className="space-y-4 border-t border-surface pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-black">
                        2. Statutory Quota Distribution Checkboxes
                      </h3>
                      <p className="mt-0.5 text-[11px] text-black">
                        Select applicable reservation quotas for this job posting.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 rounded-xl border border-surface bg-cream p-4 sm:grid-cols-2 md:grid-cols-3">
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.openMerit}
                        onChange={() => toggleQuota('openMerit')}
                        className="h-4 w-4 cursor-pointer rounded text-heritage focus:ring-0"
                      />
                      <span className="font-semibold text-black">Open Merit (General)</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.employeeChild}
                        onChange={() => toggleQuota('employeeChild')}
                        className="h-4 w-4 cursor-pointer rounded text-heritage focus:ring-0"
                      />
                      <span className="font-semibold text-black">Railway Employee Child (20%)</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.women}
                        onChange={() => toggleQuota('women')}
                        className="h-4 w-4 cursor-pointer rounded text-heritage focus:ring-0"
                      />
                      <span className="font-semibold text-black">Women Quota (15%)</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.minorities}
                        onChange={() => toggleQuota('minorities')}
                        className="h-4 w-4 cursor-pointer rounded text-heritage focus:ring-0"
                      />
                      <span className="font-semibold text-black">Minorities Quota (5%)</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.disabled}
                        onChange={() => toggleQuota('disabled')}
                        className="h-4 w-4 cursor-pointer rounded text-heritage focus:ring-0"
                      />
                      <span className="font-semibold text-black">Disabled Persons (3%)</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.punjab}
                        onChange={() => toggleQuota('punjab')}
                        className="h-4 w-4 cursor-pointer rounded text-heritage focus:ring-0"
                      />
                      <span className="font-semibold text-black">Punjab Regional Quota</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.sindh}
                        onChange={() => toggleQuota('sindh')}
                        className="h-4 w-4 cursor-pointer rounded text-heritage focus:ring-0"
                      />
                      <span className="font-semibold text-black">Sindh (Rural / Urban)</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.kpk}
                        onChange={() => toggleQuota('kpk')}
                        className="h-4 w-4 cursor-pointer rounded text-heritage focus:ring-0"
                      />
                      <span className="font-semibold text-black">KPK Regional Quota</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.balochistan}
                        onChange={() => toggleQuota('balochistan')}
                        className="h-4 w-4 cursor-pointer rounded text-heritage focus:ring-0"
                      />
                      <span className="font-semibold text-black">Balochistan Regional Quota</span>
                    </label>
                  </div>
                </div>

                {/* 3. Key Performance Indicators (KPIs) Option */}
                <div className="space-y-4 border-t border-surface pt-4">
                  <div>
                    <h3 className="text-sm font-bold text-black">
                      3. Key Performance Indicators (KPIs) &amp; Benchmarks
                    </h3>
                    <p className="mt-0.5 text-[11px] text-black">
                      Define recruitment turnaround and evaluation KPIs for this post.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {jobForm.kpis.map((kpi) => (
                      <div
                        key={kpi.id}
                        className="flex items-center justify-between rounded-lg border border-surface bg-cream p-3"
                      >
                        <div>
                          <strong className="block font-bold text-black">{kpi.title}</strong>
                          <span className="text-[11px] text-black">Target: {kpi.target}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveKpi(kpi.id)}
                          className="cursor-pointer border-none bg-transparent font-semibold text-ember hover:text-black"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="KPI Title (e.g. Document Scrutiny Time)"
                        value={newKpiTitle}
                        onChange={(e) => setNewKpiTitle(e.target.value)}
                        className="min-w-[200px] flex-1 rounded-lg border border-heritage px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Target Benchmark (e.g. 7 Days)"
                        value={newKpiTarget}
                        onChange={(e) => setNewKpiTarget(e.target.value)}
                        className="w-48 rounded-lg border border-heritage px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={handleAddKpi}
                        className="cursor-pointer rounded-lg border-none bg-heritage px-4 py-2 font-semibold text-white hover:bg-black"
                      >
                        + Add KPI Option
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 border-t border-surface pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="cursor-pointer rounded-xl border border-heritage bg-white px-5 py-2.5 font-semibold text-black hover:bg-cream"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="shadow-sm cursor-pointer rounded-xl border-none bg-heritage px-6 py-2.5 font-bold text-white hover:bg-black"
                  >
                    Save Requisition &amp; Continue
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: APPLICANTS PER JOB GRAPHS */}
          {activeTab === 'graphs' && (
            <div className="space-y-8">
              <div className="shadow-xs rounded-2xl border border-surface bg-white p-6">
                <h2 className="text-lg font-bold text-black">
                  Employer Applicants Analytics &amp; Distribution Graphs
                </h2>
                <p className="mt-1 text-xs text-black">
                  Graphical representation of total applicants per job posting and BPS tier.
                </p>
              </div>

              {/* Bar Graph */}
              <div className="shadow-xs space-y-4 rounded-2xl border border-surface bg-white p-6">
                <h3 className="border-b border-surface pb-2 text-sm font-bold text-black">
                  Applicants Count per Employer Job Post
                </h3>
                <div className="space-y-4 pt-2 text-xs">
                  {applicantBars.map((item) => (
                    <div key={item.job} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-black">{item.job}</span>
                        <span className="font-bold text-black">{item.count} Applicants</span>
                      </div>
                      <div className="h-3.5 w-full overflow-hidden rounded-full bg-cream">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: item.percent }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
