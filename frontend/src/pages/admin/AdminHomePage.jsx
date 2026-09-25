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
    policyNotes: 'All BPS-01 to BPS-15 job requisitions enforce official Pakistan Railways quota distribution rules (Open Merit, Railway Employee Child, Women, Minorities, Disabled).',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Reset password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  const [chosenStatus, setChosenStatus] = useState('');

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
    <div className="bg-gray-100 min-h-screen font-['Instrument_Sans',sans-serif] flex flex-col text-gray-900">
      
      {/* Top Header - Just Circle Profile Pic Icon with Dropdown on Top Right (No text behind/beside it) */}
      <header className="bg-[#1f4d36] text-white px-8 py-3 shadow-md flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white border border-white/20">
            <svg className="w-5 h-5 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">Pakistan Railways</h1>
            <p className="text-[11px] text-emerald-200 font-medium">Employer Admin Panel</p>
          </div>
        </div>

        {/* ONLY Circle Profile Pic Icon (No label behind or beside it) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            aria-label="Admin Profile Menu"
            className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-extrabold text-xs border-2 border-white/80 shadow-xs hover:scale-105 transition-all cursor-pointer overflow-hidden p-0"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Admin Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              (staff?.name || staff?.username || 'A').charAt(0).toUpperCase()
            )}
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 text-gray-900 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/60 rounded-t-xl">
                <p className="text-xs font-bold text-gray-900">{staff?.name || 'Admin Officer'}</p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">{staff?.email || 'admin@pakrail.gov.pk'}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setResetModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 text-left transition-colors cursor-pointer border-none bg-transparent"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Reset Password
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer border-none bg-transparent"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#1f4d36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Reset Admin Password
              </h3>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            {resetSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold text-center">
                ✓ Password reset successfully!
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
                {resetError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
                    {resetError}
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetBusy}
                    className="px-5 py-2 rounded-lg bg-[#1f4d36] text-white font-bold hover:bg-[#183e2b] cursor-pointer border-none"
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
      <div className="flex flex-1 min-h-[calc(100vh-57px)] relative">
        
        {/* Fixed Heritage Green Side Panel */}
        <aside className="w-64 bg-[#1f4d36] text-white flex-shrink-0 p-5 space-y-6 hidden md:flex md:flex-col border-r border-[#183e2b] sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <div className="px-1 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Employer Controls</p>
          </div>

          <nav className="space-y-1 text-xs font-medium flex-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left border-none cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-[#1f4d36] font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left border-none cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-[#1f4d36] font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4" />
              </svg>
              Employer Profile
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left border-none cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-white text-[#1f4d36] font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending Jobs ({jobsList.filter((j) => j.status === 'pending_approval').length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('published')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left border-none cursor-pointer ${
                activeTab === 'published'
                  ? 'bg-white text-[#1f4d36] font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Published Jobs
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left border-none cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-white text-[#1f4d36] font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create a Job
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('graphs')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left border-none cursor-pointer ${
                activeTab === 'graphs'
                  ? 'bg-white text-[#1f4d36] font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Applicants per Job Graphs
            </button>
          </nav>

          {/* Clean Side Footer Info */}
          <div className="bg-[#183e2b] rounded-xl p-4 border border-emerald-800 text-xs space-y-2">
            <p className="font-semibold text-emerald-200">Recruitment Summary</p>
            <div className="flex justify-between text-emerald-300 text-[11px]">
              <span>Active Requisitions</span>
              <strong className="text-white">{jobsList.length}</strong>
            </div>
            <div className="flex justify-between text-emerald-300 text-[11px]">
              <span>Total Applicants</span>
              <strong className="text-white">1,595</strong>
            </div>
          </div>
        </aside>

        {/* Main Dashboard Content Area */}
        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto max-w-7xl">
          
          {/* TAB 1: OVERVIEW DASHBOARD & PUBLISHED JOBS */}
          {(activeTab === 'overview' || activeTab === 'published') && (
            <div className="space-y-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between shadow-xs">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Employer Active Jobs</p>
                    <p className="text-3xl font-extrabold text-gray-900">{jobsList.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1f4d36] flex items-center justify-center border border-emerald-100">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between shadow-xs">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Pending Approvals</p>
                    <p className="text-3xl font-extrabold text-gray-900">
                      {jobsList.filter((j) => j.status === 'pending_approval').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between shadow-xs">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Total Applicants</p>
                    <p className="text-3xl font-extrabold text-gray-900">1,595</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between shadow-xs">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Employer Vacancies</p>
                    <p className="text-3xl font-extrabold text-gray-900">163</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Employer Job Postings Table */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Employer Job Postings Management</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Track and manage active recruitment requisitions for Pakistan Railways.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2.5 rounded-xl bg-[#1f4d36] text-white text-xs font-semibold hover:bg-[#183e2b] shadow-xs border-none cursor-pointer flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Job
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600 border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3">Employer Position Title</th>
                        <th className="py-3 px-3">Department</th>
                        <th className="py-3 px-3">BPS Scale</th>
                        <th className="py-3 px-3">Vacancies</th>
                        <th className="py-3 px-3">Applicants</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {jobsList.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3.5 px-3 font-bold text-gray-900">
                            <Link to={paths.adminJob(job.id)} className="hover:text-emerald-700 no-underline text-gray-900">
                              {job.title}
                            </Link>
                          </td>
                          <td className="py-3.5 px-3 text-gray-600">{job.departmentName}</td>
                          <td className="py-3.5 px-3 font-semibold">BPS - {job.bps}</td>
                          <td className="py-3.5 px-3 font-bold text-gray-900">{job.vacancies}</td>
                          <td className="py-3.5 px-3 font-bold text-blue-600">{job.applicantsCount}</td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <JobStatusBadge status={job.status} />
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <Link
                              to={`/admin/jobs/${job.id}/applications`}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#1f4d36] hover:bg-emerald-100 text-xs font-semibold no-underline border border-emerald-200 inline-block"
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-xs space-y-8">
              <div className="border-b border-gray-100 pb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Employer Profile Details</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Edit organizational information, contact details, and upload official logo/avatar.</p>
                </div>

                {profileSaved && (
                  <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                    ✓ Employer Profile updated successfully!
                  </div>
                )}
              </div>

              {/* Avatar Upload Header */}
              <div className="flex items-center gap-6 p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="w-20 h-20 rounded-full bg-[#1f4d36] text-white flex items-center justify-center font-bold text-2xl border-4 border-white shadow-md overflow-hidden relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Employer Logo" className="w-full h-full object-cover" />
                  ) : (
                    (staff?.name || 'E').charAt(0).toUpperCase()
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 text-sm">Employer Profile Picture / Logo</h3>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 rounded-lg bg-[#1f4d36] text-white text-xs font-semibold cursor-pointer hover:bg-[#183e2b] transition-colors shadow-xs">
                      Upload New Picture
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => setAvatarPreview(null)}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-100 cursor-pointer bg-white"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">Allowed formats: JPG, PNG, WEBP (Max 2MB)</p>
                </div>
              </div>

              {/* Editable Profile Form */}
              <form onSubmit={handleProfileSave} className="space-y-6 text-xs">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Organization Info */}
                  <div className="p-5 rounded-xl border border-gray-200 space-y-4">
                    <h3 className="font-bold text-gray-900 text-sm border-b border-gray-200 pb-2">Organization Information</h3>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Department / Organization Name</label>
                      <input
                        type="text"
                        required
                        value={employerProfile.departmentName}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, departmentName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Recruitment Cell ID</label>
                      <input
                        type="text"
                        required
                        value={employerProfile.cellId}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, cellId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Headquarters Address</label>
                      <input
                        type="text"
                        required
                        value={employerProfile.address}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Official Website URL</label>
                      <input
                        type="url"
                        required
                        value={employerProfile.website}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, website: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                      />
                    </div>
                  </div>

                  {/* Authority Details */}
                  <div className="p-5 rounded-xl border border-gray-200 space-y-4">
                    <h3 className="font-bold text-gray-900 text-sm border-b border-gray-200 pb-2">Employer Authority &amp; Contact</h3>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Designated Officer Name</label>
                      <input
                        type="text"
                        required
                        value={employerProfile.officerName}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, officerName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Official Email Address</label>
                      <input
                        type="email"
                        required
                        value={employerProfile.email}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Helpline Phone Number</label>
                      <input
                        type="text"
                        required
                        value={employerProfile.phone}
                        onChange={(e) => setEmployerProfile({ ...employerProfile, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Quota Distribution Policy Notes</label>
                  <textarea
                    rows={3}
                    value={employerProfile.policyNotes}
                    onChange={(e) => setEmployerProfile({ ...employerProfile, policyNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#1f4d36] text-white font-bold hover:bg-[#183e2b] cursor-pointer shadow-sm border-none"
                  >
                    Save Employer Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PENDING JOBS */}
          {activeTab === 'pending' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-900">Pending Employer Job Requisitions Inbox</h2>
                <p className="text-xs text-gray-500 mt-0.5">Requisitions awaiting formal approval before publishing to public portal.</p>
              </div>

              <div className="space-y-4">
                {jobsList
                  .filter((j) => j.status === 'pending_approval')
                  .map((job) => (
                    <div key={job.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{job.title} — BPS {job.bps}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">{job.departmentName} · Vacancies: {job.vacancies}</p>
                      </div>
                      <Link
                        to={paths.adminJob(job.id)}
                        className="px-4 py-2 rounded-lg bg-[#1f4d36] text-white font-semibold text-xs no-underline hover:bg-[#183e2b]"
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-xs space-y-8">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Create New Employer Job Requisition</h2>
                <p className="text-xs text-gray-500 mt-1">Configure position parameters, statutory category quotas, and key performance indicators.</p>
              </div>

              {formSubmitted && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                  Employer Job Requisition created and published successfully! Redirecting to published jobs...
                </div>
              )}

              <form onSubmit={handleCreateJobSubmit} className="space-y-8 text-xs">
                
                {/* 1. Basic Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">1. Employer Position Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Employer Position Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Employer - Sub Engineer Electrical"
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Department / Wing *</label>
                      <select
                        value={jobForm.department}
                        onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36] bg-white"
                      >
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Traffic &amp; Operating">Traffic &amp; Operating</option>
                        <option value="Medical Department">Medical Department</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">BPS Pay Scale *</label>
                      <select
                        value={jobForm.bps}
                        onChange={(e) => setJobForm({ ...jobForm, bps: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36] bg-white"
                      >
                        {Array.from({ length: 22 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1)}>
                            BPS-{i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Total Vacancies *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={jobForm.vacancies}
                        onChange={(e) => setJobForm({ ...jobForm, vacancies: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Statutory Quotas Checkboxes */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">2. Statutory Quota Distribution Checkboxes</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">Select applicable reservation quotas for this job posting.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.openMerit}
                        onChange={() => toggleQuota('openMerit')}
                        className="w-4 h-4 text-[#1f4d36] rounded focus:ring-0 cursor-pointer"
                      />
                      <span className="font-semibold text-gray-800">Open Merit (General)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.employeeChild}
                        onChange={() => toggleQuota('employeeChild')}
                        className="w-4 h-4 text-[#1f4d36] rounded focus:ring-0 cursor-pointer"
                      />
                      <span className="font-semibold text-gray-800">Railway Employee Child (20%)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.women}
                        onChange={() => toggleQuota('women')}
                        className="w-4 h-4 text-[#1f4d36] rounded focus:ring-0 cursor-pointer"
                      />
                      <span className="font-semibold text-gray-800">Women Quota (15%)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.minorities}
                        onChange={() => toggleQuota('minorities')}
                        className="w-4 h-4 text-[#1f4d36] rounded focus:ring-0 cursor-pointer"
                      />
                      <span className="font-semibold text-gray-800">Minorities Quota (5%)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.disabled}
                        onChange={() => toggleQuota('disabled')}
                        className="w-4 h-4 text-[#1f4d36] rounded focus:ring-0 cursor-pointer"
                      />
                      <span className="font-semibold text-gray-800">Disabled Persons (3%)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.punjab}
                        onChange={() => toggleQuota('punjab')}
                        className="w-4 h-4 text-[#1f4d36] rounded focus:ring-0 cursor-pointer"
                      />
                      <span className="font-semibold text-gray-800">Punjab Regional Quota</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.sindh}
                        onChange={() => toggleQuota('sindh')}
                        className="w-4 h-4 text-[#1f4d36] rounded focus:ring-0 cursor-pointer"
                      />
                      <span className="font-semibold text-gray-800">Sindh (Rural / Urban)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.kpk}
                        onChange={() => toggleQuota('kpk')}
                        className="w-4 h-4 text-[#1f4d36] rounded focus:ring-0 cursor-pointer"
                      />
                      <span className="font-semibold text-gray-800">KPK Regional Quota</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={jobForm.quotas.balochistan}
                        onChange={() => toggleQuota('balochistan')}
                        className="w-4 h-4 text-[#1f4d36] rounded focus:ring-0 cursor-pointer"
                      />
                      <span className="font-semibold text-gray-800">Balochistan Regional Quota</span>
                    </label>
                  </div>
                </div>

                {/* 3. Key Performance Indicators (KPIs) Option */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">3. Key Performance Indicators (KPIs) &amp; Benchmarks</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">Define recruitment turnaround and evaluation KPIs for this post.</p>
                  </div>

                  <div className="space-y-3">
                    {jobForm.kpis.map((kpi) => (
                      <div key={kpi.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <div>
                          <strong className="text-gray-900 font-bold block">{kpi.title}</strong>
                          <span className="text-gray-500 text-[11px]">Target: {kpi.target}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveKpi(kpi.id)}
                          className="text-red-600 hover:text-red-800 font-semibold cursor-pointer border-none bg-transparent"
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
                        className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-gray-300"
                      />
                      <input
                        type="text"
                        placeholder="Target Benchmark (e.g. 7 Days)"
                        value={newKpiTarget}
                        onChange={(e) => setNewKpiTarget(e.target.value)}
                        className="w-48 px-3 py-2 rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleAddKpi}
                        className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 cursor-pointer border-none"
                      >
                        + Add KPI Option
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#1f4d36] text-white font-bold hover:bg-[#183e2b] cursor-pointer shadow-sm border-none"
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
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
                <h2 className="text-lg font-bold text-gray-900">Employer Applicants Analytics &amp; Distribution Graphs</h2>
                <p className="text-xs text-gray-500 mt-1">Graphical representation of total applicants per job posting and BPS tier.</p>
              </div>

              {/* Bar Graph */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Applicants Count per Employer Job Post
                </h3>
                <div className="space-y-4 pt-2 text-xs">
                  {[
                    { job: 'Employer - Senior Technician (BPS-09)', count: 520, percent: '85%', color: 'bg-[#1f4d36]' },
                    { job: 'Employer - Sub Engineer (BPS-11)', count: 412, percent: '70%', color: 'bg-emerald-600' },
                    { job: 'Employer - Loco Pilot (BPS-09)', count: 380, percent: '62%', color: 'bg-blue-600' },
                    { job: 'Employer - Assistant Station Master (BPS-14)', count: 195, percent: '35%', color: 'bg-amber-500' },
                    { job: 'Employer - Executive Engineer (BPS-17)', count: 88, percent: '18%', color: 'bg-purple-600' },
                  ].map((item) => (
                    <div key={item.job} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-800">{item.job}</span>
                        <span className="text-gray-900 font-bold">{item.count} Applicants</span>
                      </div>
                      <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: item.percent }}></div>
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
