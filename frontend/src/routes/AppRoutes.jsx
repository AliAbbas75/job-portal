import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoadingState } from '../components/common/PageState';
import { AppLayout } from '../components/layout/AppLayout';
import JobDetailsPage from '../pages/public/JobDetailsPage';
import JobSearchPage from '../pages/public/JobSearchPage';
import LoginPage from '../pages/public/LoginPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import SignupPage from '../pages/public/SignupPage';
import { paths } from './paths';
import { RequireCandidate } from './RequireCandidate';
import { RequireStaff } from './RequireStaff';

// Candidate and staff pages load on demand to keep the first download small.
const AdminHomePage = lazy(() => import('../pages/admin/AdminHomePage'));
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
          <Route path={paths.home} element={<JobSearchPage />} />
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
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
