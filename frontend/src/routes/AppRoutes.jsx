import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoadingState } from '../components/common/PageState';
import { AdminLayout } from '../components/layout/AdminLayout';
import { AppLayout } from '../components/layout/AppLayout';
import JobDetailsPage from '../pages/public/JobDetailsPage';
import HomePage from '../pages/public/HomePage';
import JobSearchPage from '../pages/public/JobSearchPage';
import LoginPage from '../pages/public/LoginPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import SignupPage from '../pages/public/SignupPage';
import { paths } from './paths';
import { RequireCandidate } from './RequireCandidate';
import { RequireStaff } from './RequireStaff';
import { APPROVER_ROLES, CREATOR_ROLES } from '../utils/staffRoles';

// Candidate and staff pages load on demand to keep the first download small.
const AdminHomePage = lazy(() => import('../pages/admin/AdminHomePage'));
const AdminJobPage = lazy(() => import('../pages/admin/AdminJobPage'));
const AdminJobsPage = lazy(() => import('../pages/admin/AdminJobsPage'));
const JobApplicationsPage = lazy(() => import('../pages/admin/JobApplicationsPage'));
const JobFormPage = lazy(() => import('../pages/admin/JobFormPage'));
const StaffLoginPage = lazy(() => import('../pages/admin/StaffLoginPage'));
const ProfilePage = lazy(() => import('../pages/candidate/ProfilePage'));
const ApplicationCheckPage = lazy(() => import('../pages/candidate/ApplicationCheckPage'));
const ApplicationReviewPage = lazy(() => import('../pages/candidate/ApplicationReviewPage'));
const MyApplicationsPage = lazy(() => import('../pages/candidate/MyApplicationsPage'));
const ApplicationDetailPage = lazy(() => import('../pages/candidate/ApplicationDetailPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={paths.home} element={<HomePage />} />
          <Route path={paths.jobs} element={<JobSearchPage />} />
          <Route path={paths.job()} element={<JobDetailsPage />} />
          <Route path={paths.signup} element={<SignupPage />} />
          <Route path={paths.login} element={<LoginPage />} />

          <Route element={<RequireCandidate />}>
            <Route path={paths.profile} element={<ProfilePage />} />
            <Route path={paths.applyCheck()} element={<ApplicationCheckPage />} />
            <Route path={paths.applyReview()} element={<ApplicationReviewPage />} />
            <Route path={paths.applications} element={<MyApplicationsPage />} />
            <Route path={paths.application()} element={<ApplicationDetailPage />} />
          </Route>

          <Route path={paths.adminLogin} element={<StaffLoginPage />} />
          <Route element={<RequireStaff />}>
            <Route path={paths.admin} element={<AdminHomePage />} />
            <Route element={<AdminLayout />}>
              <Route path={paths.adminJob()} element={<AdminJobPage />} />
              <Route path={paths.adminJobApplications()} element={<JobApplicationsPage />} />
            </Route>
          </Route>
          <Route element={<RequireStaff roles={APPROVER_ROLES} />}>
            <Route element={<AdminLayout />}>
              <Route path={paths.adminApprovals} element={<AdminJobsPage approvals />} />
            </Route>
          </Route>
          <Route element={<RequireStaff roles={CREATOR_ROLES} />}>
            <Route element={<AdminLayout />}>
              <Route path={paths.adminEditJob()} element={<JobFormPage />} />
              <Route path={paths.adminNewJob} element={<JobFormPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
