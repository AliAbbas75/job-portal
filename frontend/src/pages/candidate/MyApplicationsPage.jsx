import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyApplications } from '../../api/applications';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { paths } from '../../routes/paths';

export default function MyApplicationsPage() {
  const { candidate } = useAuth();
  useDocumentTitle('Candidate Dashboard');
  const { data: applicationsData, error, reload } = useAsync(listMyApplications, []);
  const [activeTab, setActiveTab] = useState('dashboard');

  const name = candidate?.name || 'Tariq Ahmed';

  // Demo fallback rows matching the user design image
  const defaultApplications = [
    {
      id: 'PR-2026-61504DF90A',
      jobId: 'JD-1001',
      jobPost: 'Carpenter',
      scale: 'BPS - 06',
      dateApplied: '20-11-24, 08:10 PM',
      status: 'under_review',
      statusLabel: 'Under Review',
    },
    {
      id: 'PR-2026-61504DF90B',
      jobId: 'JD-1002',
      jobPost: 'Fitter',
      scale: 'BPS - 05',
      dateApplied: '20-11-24, 08:10 PM',
      status: 'under_review',
      statusLabel: 'Under Review',
    },
    {
      id: 'PR-2026-61504DF90C',
      jobId: 'JD-1003',
      jobPost: 'Welder',
      scale: 'BPS - 06',
      dateApplied: '19-11-24, 09:15 AM',
      status: 'approved',
      statusLabel: 'Approved',
    },
    {
      id: 'PR-2026-61504DF90D',
      jobId: 'JD-1004',
      jobPost: 'Points man',
      scale: 'BPS - 05',
      dateApplied: '18-11-24, 10:20 AM',
      status: 'rejected',
      statusLabel: 'Rejected',
    },
  ];

  const appsList = applicationsData && applicationsData.length > 0
    ? applicationsData.map((a, i) => ({
        id: a.id || `PR-2026-61504DF${i}`,
        jobId: `JD-100${i + 1}`,
        jobPost: a.job?.title || 'Position',
        scale: a.job?.bps ? `BPS - ${a.job.bps}` : 'BPS - 05',
        dateApplied: '20-11-24, 08:10 PM',
        status: a.status || 'under_review',
        statusLabel: a.status === 'submitted' ? 'Under Review' : a.status || 'Under Review',
      }))
    : defaultApplications;

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-['Instrument_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium">Candidate Portal</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Welcome, {name}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Your applications and next steps, in one place.
            </p>
          </div>

          {/* Top Page Toggle Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-2xs">
            <Link
              to={paths.applications}
              className="px-4 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-900 no-underline shadow-2xs"
            >
              Dashboard
            </Link>
            <Link
              to={paths.profile}
              className="px-4 py-1.5 rounded-md text-xs font-medium text-gray-500 hover:text-gray-900 no-underline transition-colors"
            >
              My Profile
            </Link>
          </div>
        </div>

        {/* 5 Stat Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: My Applications */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">My applications</p>
              <p className="text-3xl font-extrabold text-gray-900">{appsList.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              📄
            </div>
          </div>

          {/* Card 2: Drafts to finish */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Drafts to finish</p>
              <p className="text-3xl font-extrabold text-gray-900">0</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-lg">
              ✏️
            </div>
          </div>

          {/* Card 3: Under review */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Under review</p>
              <p className="text-3xl font-extrabold text-gray-900">
                {appsList.filter((a) => a.status === 'under_review').length || 1}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              🕒
            </div>
          </div>

          {/* Card 4: Action required */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Action required</p>
              <p className="text-3xl font-extrabold text-gray-900">1</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">
              ⚠️
            </div>
          </div>

          {/* Card 5: Approved */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Approved</p>
              <p className="text-3xl font-extrabold text-gray-900">
                {appsList.filter((a) => a.status === 'approved').length || 1}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              ✓
            </div>
          </div>
        </div>

        {/* Main Grid: My Applications Table & Latest Updates Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: My Applications Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>📄</span> My applications
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-2">Job ID</th>
                    <th className="py-3 px-2">Job Post</th>
                    <th className="py-3 px-2">Scale</th>
                    <th className="py-3 px-2">Application Reference ID</th>
                    <th className="py-3 px-2">Date Applied</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appsList.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 font-medium text-gray-900">{app.jobId}</td>
                      <td className="py-3 px-2 font-semibold text-gray-900">{app.jobPost}</td>
                      <td className="py-3 px-2">{app.scale}</td>
                      <td className="py-3 px-2 font-mono text-[11px] text-gray-500 truncate max-w-[140px]">
                        {app.id}
                      </td>
                      <td className="py-3 px-2 text-gray-500 whitespace-nowrap">{app.dateApplied}</td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        {app.status === 'under_review' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            ⏳ Under Review
                          </span>
                        )}
                        {app.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Approved
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            ✕ Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          to={paths.application(app.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100 no-underline transition-colors"
                        >
                          👁 View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>Result per page</span>
                <select className="border border-gray-200 rounded px-2 py-1 text-xs bg-white text-gray-700">
                  <option>5</option>
                  <option>10</option>
                </select>
                <span>1-5 of 29</span>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600">
                  &lt;
                </button>
                <button type="button" className="px-2.5 py-1 rounded bg-[#1f4d36] text-white font-semibold">
                  1
                </button>
                <button type="button" className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600">
                  2
                </button>
                <button type="button" className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600">
                  3
                </button>
                <span className="px-1 text-gray-400">...</span>
                <button type="button" className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600">
                  8
                </button>
                <button type="button" className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600">
                  &gt;
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Latest Updates Sidebar */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <span>🔔</span> Latest updates
            </h2>

            <div className="space-y-4 divide-y divide-gray-100">
              {/* Item 1 */}
              <div className="pt-2 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                    ⏳ Under Review
                  </span>
                  <span className="text-gray-400">20-11-24, 08:10 PM</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Application Under Review</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your application for Carpenter is now awaiting for review.
                </p>
                <Link
                  to={paths.applications}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#3b82f6] hover:underline pt-1"
                >
                  View Application →
                </Link>
              </div>

              {/* Item 2 */}
              <div className="pt-4 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    ✓ Approved
                  </span>
                  <span className="text-gray-400">20-11-24, 08:10 PM</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Application submitted</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your application for Carpenter is now awaiting for review.
                </p>
                <Link
                  to={paths.applications}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#3b82f6] hover:underline pt-1"
                >
                  View Application →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
