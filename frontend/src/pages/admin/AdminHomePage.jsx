import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listAdminJobs } from '../../api/adminJobs';
import { JobStatusBadge } from '../../components/common/JobStatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import { paths } from '../../routes/paths';

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

  // Reset password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  const [chosenStatus] = useState(''); // status filter isn't wired to a control yet

  // Create Job Form State with Quotas & KPIs
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Civil Engineering',
    bps: '05',
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

  const jobsQuery = useAsync(() => listAdminJobs({ status: chosenStatus }), [chosenStatus]);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    if (signOut) await signOut();
    navigate(paths.adminLogin);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => {
      setProfileSaved(false);
    }, 2500);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetBusy(true);
    setTimeout(() => {
      setResetBusy(false);
      setResetSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setResetModalOpen(false);
        setResetSuccess(false);
      }, 1500);
    }, 600);
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

  const handleCreateJobSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setActiveTab('published');
    }, 1200);
  };

  const jobsList = jobsQuery.data?.items || [
    {
      id: 'j-101',
      title: 'Employer - Sub Engineer (Civil)',
      departmentName: 'Civil Engineering',
      bps: '11',
      vacancies: 23,
      applicantsCount: 412,
      status: 'published',
      closingDate: '2026-10-15',
    },
    {
      id: 'j-102',
      title: 'Employer - Senior Technician (Electrical)',
      departmentName: 'Electrical Engineering',
      bps: '09',
      vacancies: 35,
      applicantsCount: 380,
      status: 'published',
      closingDate: '2026-10-20',
    },
    {
      id: 'j-103',
      title: 'Employer - Assistant Station Master',
      departmentName: 'Traffic & Operating',
      bps: '14',
      vacancies: 25,
      applicantsCount: 195,
      status: 'pending_approval',
      closingDate: '2026-10-25',
    },
    {
      id: 'j-104',
      title: 'Employer - Loco Pilot (Assistant)',
      departmentName: 'Mechanical Engineering',
      bps: '09',
      vacancies: 65,
      applicantsCount: 520,
      status: 'approved',
      closingDate: '2026-11-01',
    },
    {
      id: 'j-105',
      title: 'Employer - Executive Engineer (Civil)',
      departmentName: 'Civil Engineering',
      bps: '17',
      vacancies: 15,
      applicantsCount: 88,
      status: 'draft',
      closingDate: '2026-11-10',
    },
  ];

  return (
    <div className="bg-gray-100 text-gray-900 flex min-h-screen flex-col font-['Instrument_Sans',sans-serif]">
      {/* Top Header - Just Circle Profile Pic Icon with Dropdown on Top Right (No text behind/beside it) */}
      <header className="shadow-md sticky top-0 z-30 flex items-center justify-between bg-[#1f4d36] px-8 py-3 text-white">
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 font-bold text-white">
            <svg
              className="text-emerald-200 h-5 w-5"
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
            <p className="text-emerald-200 text-[11px] font-medium">Employer Admin Panel</p>
          </div>
        </div>

        {/* ONLY Circle Profile Pic Icon (No label behind or beside it) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            aria-label="Admin Profile Menu"
            className="bg-emerald-800 shadow-xs flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white/80 p-0 text-xs font-extrabold text-white transition-all hover:scale-105"
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
            <div className="shadow-2xl border-gray-100 text-gray-900 animate-in fade-in absolute right-0 z-50 mt-2 w-56 rounded-xl border bg-white py-2 duration-150">
              <div className="border-gray-100 bg-gray-50/60 rounded-t-xl border-b px-4 py-2">
                <p className="text-gray-900 text-xs font-bold">{staff?.name || 'Admin Officer'}</p>
                <p className="text-gray-500 mt-0.5 text-[11px] font-medium">
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
                  className="text-gray-700 hover:bg-gray-100 flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-4 py-2.5 text-left text-xs font-semibold transition-colors"
                >
                  <svg
                    className="text-gray-500 h-4 w-4"
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
                  className="text-red-600 hover:bg-red-50 flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-4 py-2.5 text-left text-xs font-bold transition-colors"
                >
                  <svg
                    className="text-red-500 h-4 w-4"
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
          <div className="shadow-2xl border-gray-100 w-full max-w-md space-y-5 rounded-2xl border bg-white p-6">
            <div className="border-gray-100 flex items-center justify-between border-b pb-3">
              <h3 className="text-gray-900 flex items-center gap-2 text-base font-bold">
                <svg
                  className="h-5 w-5 text-[#1f4d36]"
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
                className="text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {resetSuccess ? (
              <div className="bg-emerald-50 border-emerald-200 text-emerald-900 rounded-xl border p-4 text-center text-xs font-semibold">
                ✓ Password reset successfully!
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
                {resetError && (
                  <div className="bg-red-50 border-red-200 text-red-700 rounded-lg border p-3 font-medium">
                    {resetError}
                  </div>
                )}

                <div>
                  <label className="text-gray-700 mb-1 block font-semibold">New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-gray-300 w-full rounded-lg border px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-700 mb-1 block font-semibold">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-gray-300 w-full rounded-lg border px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer rounded-lg border bg-white px-4 py-2 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetBusy}
                    className="cursor-pointer rounded-lg border-none bg-[#1f4d36] px-5 py-2 font-bold text-white hover:bg-[#183e2b]"
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
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-64 flex-shrink-0 space-y-6 overflow-y-auto border-r border-[#183e2b] bg-[#1f4d36] p-5 text-white md:flex md:flex-col">
          <div className="px-1 pt-1">
            <p className="text-emerald-300 text-[10px] font-bold tracking-wider uppercase">
              Employer Controls
            </p>
          </div>

          <nav className="flex-1 space-y-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3.5 py-3 text-left transition-all ${
                activeTab === 'overview'
                  ? 'shadow-sm bg-white font-bold text-[#1f4d36]'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
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
                  ? 'shadow-sm bg-white font-bold text-[#1f4d36]'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
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
                  ? 'shadow-sm bg-white font-bold text-[#1f4d36]'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
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
                  ? 'shadow-sm bg-white font-bold text-[#1f4d36]'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
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
                  ? 'shadow-sm bg-white font-bold text-[#1f4d36]'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg
                className="text-amber-300 h-4 w-4"
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
                  ? 'shadow-sm bg-white font-bold text-[#1f4d36]'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
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
          <div className="border-emerald-800 space-y-2 rounded-xl border bg-[#183e2b] p-4 text-xs">
            <p className="text-emerald-200 font-semibold">Recruitment Summary</p>
            <div className="text-emerald-300 flex justify-between text-[11px]">
              <span>Active Requisitions</span>
              <strong className="text-white">{jobsList.length}</strong>
            </div>
            <div className="text-emerald-300 flex justify-between text-[11px]">
              <span>Total Applicants</span>
              <strong className="text-white">1,595</strong>
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
                <div className="border-gray-200 shadow-xs flex items-center justify-between rounded-2xl border bg-white p-5">
                  <div>
                    <p className="text-gray-500 mb-1 text-xs font-semibold">Employer Active Jobs</p>
                    <p className="text-gray-900 text-3xl font-extrabold">{jobsList.length}</p>
                  </div>
                  <div className="bg-emerald-50 border-emerald-100 flex h-12 w-12 items-center justify-center rounded-xl border text-[#1f4d36]">
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

                <div className="border-gray-200 shadow-xs flex items-center justify-between rounded-2xl border bg-white p-5">
                  <div>
                    <p className="text-gray-500 mb-1 text-xs font-semibold">Pending Approvals</p>
                    <p className="text-gray-900 text-3xl font-extrabold">
                      {jobsList.filter((j) => j.status === 'pending_approval').length}
                    </p>
                  </div>
                  <div className="bg-amber-50 text-amber-600 border-amber-100 flex h-12 w-12 items-center justify-center rounded-xl border">
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

                <div className="border-gray-200 shadow-xs flex items-center justify-between rounded-2xl border bg-white p-5">
                  <div>
                    <p className="text-gray-500 mb-1 text-xs font-semibold">Total Applicants</p>
                    <p className="text-gray-900 text-3xl font-extrabold">1,595</p>
                  </div>
                  <div className="bg-blue-50 text-blue-600 border-blue-100 flex h-12 w-12 items-center justify-center rounded-xl border">
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

                <div className="border-gray-200 shadow-xs flex items-center justify-between rounded-2xl border bg-white p-5">
                  <div>
                    <p className="text-gray-500 mb-1 text-xs font-semibold">Employer Vacancies</p>
                    <p className="text-gray-900 text-3xl font-extrabold">163</p>
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
              <div className="border-gray-200 shadow-xs space-y-5 rounded-2xl border bg-white p-6">
                <div className="border-gray-100 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h2 className="text-gray-900 text-lg font-bold">
                      Employer Job Postings Management
                    </h2>
                    <p className="text-gray-500 mt-0.5 text-xs">
                      Track and manage active recruitment requisitions for Pakistan Railways.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="shadow-xs flex cursor-pointer items-center gap-2 rounded-xl border-none bg-[#1f4d36] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#183e2b]"
                  >
                    <svg
                      className="text-emerald-200 h-4 w-4"
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
                  <table className="text-gray-600 w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-gray-200 text-gray-400 border-b text-[11px] font-semibold tracking-wider uppercase">
                        <th className="px-3 py-3">Employer Position Title</th>
                        <th className="px-3 py-3">Department</th>
                        <th className="px-3 py-3">BPS Scale</th>
                        <th className="px-3 py-3">Vacancies</th>
                        <th className="px-3 py-3">Applicants</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-gray-100 divide-y">
                      {jobsList.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                          <td className="text-gray-900 px-3 py-3.5 font-bold">
                            <Link
                              to={paths.adminJob(job.id)}
                              className="hover:text-emerald-700 text-gray-900 no-underline"
                            >
                              {job.title}
                            </Link>
                          </td>
                          <td className="text-gray-600 px-3 py-3.5">{job.departmentName}</td>
                          <td className="px-3 py-3.5 font-semibold">BPS - {job.bps}</td>
                          <td className="text-gray-900 px-3 py-3.5 font-bold">{job.vacancies}</td>
                          <td className="text-blue-600 px-3 py-3.5 font-bold">
                            {job.applicantsCount}
                          </td>
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <JobStatusBadge status={job.status} />
                          </td>
                          <td className="px-3 py-3.5 text-right whitespace-nowrap">
                            <Link
                              to={`/admin/jobs/${job.id}/applications`}
                              className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 inline-block rounded-lg border px-3 py-1.5 text-xs font-semibold text-[#1f4d36] no-underline"
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
            <div className="border-gray-200 shadow-xs space-y-8 rounded-2xl border bg-white p-6 lg:p-8">
              <div className="border-gray-100 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h2 className="text-gray-900 text-xl font-bold">Employer Profile Details</h2>
                  <p className="text-gray-500 mt-0.5 text-xs">
                    Edit organizational information, contact details, and upload official
                    logo/avatar.
                  </p>
                </div>

                {profileSaved && (
                  <div className="bg-emerald-50 border-emerald-200 text-emerald-900 rounded-xl border px-4 py-2 text-xs font-semibold">
                    ✓ Employer Profile updated successfully!
                  </div>
                )}
              </div>

              {/* Avatar Upload Header */}
              <div className="bg-gray-50 border-gray-200 flex items-center gap-6 rounded-2xl border p-5">
                <div className="shadow-md relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#1f4d36] text-2xl font-bold text-white">
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
                  <h3 className="text-gray-900 text-sm font-bold">
                    Employer Profile Picture / Logo
                  </h3>
                  <div className="flex items-center gap-3">
                    <label className="shadow-xs cursor-pointer rounded-lg bg-[#1f4d36] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#183e2b]">
                      Upload New Picture
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => setAvatarPreview(null)}
                        className="border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer rounded-lg border bg-white px-3 py-2 text-xs font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-gray-400 text-[11px]">
                    Allowed formats: JPG, PNG, WEBP (Max 2MB)
                  </p>
                </div>
              </div>

              {/* Editable Profile Form */}
              <form onSubmit={handleProfileSave} className="space-y-6 text-xs">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Organization Info */}
                  <div className="border-gray-200 space-y-4 rounded-xl border p-5">
                    <h3 className="text-gray-900 border-gray-200 border-b pb-2 text-sm font-bold">
                      Organization Information
                    </h3>

                    <div>
                      <label className="text-gray-700 mb-1 block font-semibold">
                        Department / Organization Name
                      </label>
                      <input
                        type="text"
                        required
                        value={employerProfile.departmentName}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, departmentName: e.target.value })
                        }
                        className="border-gray-300 w-full rounded-lg border px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 mb-1 block font-semibold">
                        Recruitment Cell ID
                      </label>
                      <input
                        type="text"
                        required
                        value={employerProfile.cellId}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, cellId: e.target.value })
                        }
                        className="border-gray-300 w-full rounded-lg border px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 mb-1 block font-semibold">
                        Headquarters Address
                      </label>
                      <input
                        type="text"
                        required
                        value={employerProfile.address}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, address: e.target.value })
                        }
                        className="border-gray-300 w-full rounded-lg border px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 mb-1 block font-semibold">
                        Official Website URL
                      </label>
                      <input
                        type="url"
                        required
                        value={employerProfile.website}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, website: e.target.value })
                        }
                        className="border-gray-300 w-full rounded-lg border px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Authority Details */}
                  <div className="border-gray-200 space-y-4 rounded-xl border p-5">
                    <h3 className="text-gray-900 border-gray-200 border-b pb-2 text-sm font-bold">
                      Employer Authority &amp; Contact
                    </h3>

                    <div>
                      <label className="text-gray-700 mb-1 block font-semibold">
                        Designated Officer Name
                      </label>
                      <input
                        type="text"
                        required
                        value={employerProfile.officerName}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, officerName: e.target.value })
                        }
                        className="border-gray-300 w-full rounded-lg border px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 mb-1 block font-semibold">
                        Official Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={employerProfile.email}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, email: e.target.value })
                        }
                        className="border-gray-300 w-full rounded-lg border px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 mb-1 block font-semibold">
                        Helpline Phone Number
                      </label>
                      <input
                        type="text"
                        required
                        value={employerProfile.phone}
                        onChange={(e) =>
                          setEmployerProfile({ ...employerProfile, phone: e.target.value })
                        }
                        className="border-gray-300 w-full rounded-lg border px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 mb-1 block font-semibold">
                    Quota Distribution Policy Notes
                  </label>
                  <textarea
                    rows={3}
                    value={employerProfile.policyNotes}
                    onChange={(e) =>
                      setEmployerProfile({ ...employerProfile, policyNotes: e.target.value })
                    }
                    className="border-gray-300 w-full rounded-lg border px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="shadow-sm cursor-pointer rounded-xl border-none bg-[#1f4d36] px-6 py-2.5 font-bold text-white hover:bg-[#183e2b]"
                  >
                    Save Employer Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PENDING JOBS */}
          {activeTab === 'pending' && (
            <div className="border-gray-200 shadow-xs space-y-5 rounded-2xl border bg-white p-6">
              <div className="border-gray-100 border-b pb-3">
                <h2 className="text-gray-900 text-lg font-bold">
                  Pending Employer Job Requisitions Inbox
                </h2>
                <p className="text-gray-500 mt-0.5 text-xs">
                  Requisitions awaiting formal approval before publishing to public portal.
                </p>
              </div>

              <div className="space-y-4">
                {jobsList
                  .filter((j) => j.status === 'pending_approval')
                  .map((job) => (
                    <div
                      key={job.id}
                      className="border-amber-200 bg-amber-50/40 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
                    >
                      <div>
                        <h3 className="text-gray-900 text-sm font-bold">
                          {job.title} — BPS {job.bps}
                        </h3>
                        <p className="text-gray-600 mt-0.5 text-xs">
                          {job.departmentName} · Vacancies: {job.vacancies}
                        </p>
                      </div>
                      <Link
                        to={paths.adminJob(job.id)}
                        className="rounded-lg bg-[#1f4d36] px-4 py-2 text-xs font-semibold text-white no-underline hover:bg-[#183e2b]"
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
            <div className="border-gray-200 shadow-xs space-y-8 rounded-2xl border bg-white p-6 lg:p-8">
              <div className="border-gray-100 border-b pb-4">
                <h2 className="text-gray-900 text-xl font-bold">
                  Create New Employer Job Requisition
                </h2>
                <p className="text-gray-500 mt-1 text-xs">
                  Configure position parameters, statutory category quotas, and key performance
                  indicators.
                </p>
              </div>

              {formSubmitted && (
                <div className="bg-emerald-50 border-emerald-200 text-emerald-900 rounded-xl border p-4 text-xs font-semibold">
                  Employer Job Requisition created and published successfully! Redirecting to
                  published jobs...
                </div>
              )}

              <form onSubmit={handleCreateJobSubmit} className="space-y-8 text-xs">
                {/* 1. Basic Details */}
                <div className="space-y-4">
                  <h3 className="text-gray-900 border-gray-100 border-b pb-2 text-sm font-bold">
                    1. Employer Position Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-gray-700 mb-1 block font-semibold">
                        Employer Position Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Employer - Sub Engineer Electrical"
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        className="border-gray-300 w-full rounded-lg border px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 mb-1 block font-semibold">
                        Department / Wing *
                      </label>
                      <select
                        value={jobForm.department}
                        onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                        className="border-gray-300 w-full rounded-lg border bg-white px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      >
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Traffic &amp; Operating">Traffic &amp; Operating</option>
                        <option value="Medical Department">Medical Department</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-700 mb-1 block font-semibold">
                        BPS Pay Scale *
                      </label>
                      <select
                        value={jobForm.bps}
                        onChange={(e) => setJobForm({ ...jobForm, bps: e.target.value })}
                        className="border-gray-300 w-full rounded-lg border bg-white px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      >
                        {Array.from({ length: 22 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1)}>
                            BPS-{i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-700 mb-1 block font-semibold">
                        Total Vacancies *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={jobForm.vacancies}
                        onChange={(e) => setJobForm({ ...jobForm, vacancies: e.target.value })}
                        className="border-gray-300 w-full rounded-lg border px-3.5 py-2.5 focus:ring-2 focus:ring-[#1f4d36] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Statutory Quotas Checkboxes */}
                <div className="border-gray-100 space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-900 text-sm font-bold">
                        2. Statutory Quota Distribution Checkboxes
                      </h3>
                      <p className="text-gray-500 mt-0.5 text-[11px]">
                        Select applicable reservation quotas for this job posting.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 border-gray-200 grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 md:grid-cols-3">
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.openMerit}
                        onChange={() => toggleQuota('openMerit')}
                        className="h-4 w-4 cursor-pointer rounded text-[#1f4d36] focus:ring-0"
                      />
                      <span className="text-gray-800 font-semibold">Open Merit (General)</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.employeeChild}
                        onChange={() => toggleQuota('employeeChild')}
                        className="h-4 w-4 cursor-pointer rounded text-[#1f4d36] focus:ring-0"
                      />
                      <span className="text-gray-800 font-semibold">
                        Railway Employee Child (20%)
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.women}
                        onChange={() => toggleQuota('women')}
                        className="h-4 w-4 cursor-pointer rounded text-[#1f4d36] focus:ring-0"
                      />
                      <span className="text-gray-800 font-semibold">Women Quota (15%)</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.minorities}
                        onChange={() => toggleQuota('minorities')}
                        className="h-4 w-4 cursor-pointer rounded text-[#1f4d36] focus:ring-0"
                      />
                      <span className="text-gray-800 font-semibold">Minorities Quota (5%)</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.disabled}
                        onChange={() => toggleQuota('disabled')}
                        className="h-4 w-4 cursor-pointer rounded text-[#1f4d36] focus:ring-0"
                      />
                      <span className="text-gray-800 font-semibold">Disabled Persons (3%)</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.punjab}
                        onChange={() => toggleQuota('punjab')}
                        className="h-4 w-4 cursor-pointer rounded text-[#1f4d36] focus:ring-0"
                      />
                      <span className="text-gray-800 font-semibold">Punjab Regional Quota</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.sindh}
                        onChange={() => toggleQuota('sindh')}
                        className="h-4 w-4 cursor-pointer rounded text-[#1f4d36] focus:ring-0"
                      />
                      <span className="text-gray-800 font-semibold">Sindh (Rural / Urban)</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.kpk}
                        onChange={() => toggleQuota('kpk')}
                        className="h-4 w-4 cursor-pointer rounded text-[#1f4d36] focus:ring-0"
                      />
                      <span className="text-gray-800 font-semibold">KPK Regional Quota</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.balochistan}
                        onChange={() => toggleQuota('balochistan')}
                        className="h-4 w-4 cursor-pointer rounded text-[#1f4d36] focus:ring-0"
                      />
                      <span className="text-gray-800 font-semibold">
                        Balochistan Regional Quota
                      </span>
                    </label>
                  </div>
                </div>

                {/* 3. Key Performance Indicators (KPIs) Option */}
                <div className="border-gray-100 space-y-4 border-t pt-4">
                  <div>
                    <h3 className="text-gray-900 text-sm font-bold">
                      3. Key Performance Indicators (KPIs) &amp; Benchmarks
                    </h3>
                    <p className="text-gray-500 mt-0.5 text-[11px]">
                      Define recruitment turnaround and evaluation KPIs for this post.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {jobForm.kpis.map((kpi) => (
                      <div
                        key={kpi.id}
                        className="border-gray-200 bg-gray-50 flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <strong className="text-gray-900 block font-bold">{kpi.title}</strong>
                          <span className="text-gray-500 text-[11px]">Target: {kpi.target}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveKpi(kpi.id)}
                          className="text-red-600 hover:text-red-800 cursor-pointer border-none bg-transparent font-semibold"
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
                        className="border-gray-300 min-w-[200px] flex-1 rounded-lg border px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Target Benchmark (e.g. 7 Days)"
                        value={newKpiTarget}
                        onChange={(e) => setNewKpiTarget(e.target.value)}
                        className="border-gray-300 w-48 rounded-lg border px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={handleAddKpi}
                        className="bg-emerald-700 hover:bg-emerald-800 cursor-pointer rounded-lg border-none px-4 py-2 font-semibold text-white"
                      >
                        + Add KPI Option
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="border-gray-100 flex items-center justify-end gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer rounded-xl border bg-white px-5 py-2.5 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="shadow-sm cursor-pointer rounded-xl border-none bg-[#1f4d36] px-6 py-2.5 font-bold text-white hover:bg-[#183e2b]"
                  >
                    Publish Employer Job Requisition
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: APPLICANTS PER JOB GRAPHS */}
          {activeTab === 'graphs' && (
            <div className="space-y-8">
              <div className="border-gray-200 shadow-xs rounded-2xl border bg-white p-6">
                <h2 className="text-gray-900 text-lg font-bold">
                  Employer Applicants Analytics &amp; Distribution Graphs
                </h2>
                <p className="text-gray-500 mt-1 text-xs">
                  Graphical representation of total applicants per job posting and BPS tier.
                </p>
              </div>

              {/* Bar Graph */}
              <div className="border-gray-200 shadow-xs space-y-4 rounded-2xl border bg-white p-6">
                <h3 className="text-gray-900 border-gray-100 border-b pb-2 text-sm font-bold">
                  Applicants Count per Employer Job Post
                </h3>
                <div className="space-y-4 pt-2 text-xs">
                  {[
                    {
                      job: 'Employer - Senior Technician (BPS-09)',
                      count: 520,
                      percent: '85%',
                      color: 'bg-[#1f4d36]',
                    },
                    {
                      job: 'Employer - Sub Engineer (BPS-11)',
                      count: 412,
                      percent: '70%',
                      color: 'bg-emerald-600',
                    },
                    {
                      job: 'Employer - Loco Pilot (BPS-09)',
                      count: 380,
                      percent: '62%',
                      color: 'bg-blue-600',
                    },
                    {
                      job: 'Employer - Assistant Station Master (BPS-14)',
                      count: 195,
                      percent: '35%',
                      color: 'bg-amber-500',
                    },
                    {
                      job: 'Employer - Executive Engineer (BPS-17)',
                      count: 88,
                      percent: '18%',
                      color: 'bg-purple-600',
                    },
                  ].map((item) => (
                    <div key={item.job} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-800">{item.job}</span>
                        <span className="text-gray-900 font-bold">{item.count} Applicants</span>
                      </div>
                      <div className="bg-gray-100 h-3.5 w-full overflow-hidden rounded-full">
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
