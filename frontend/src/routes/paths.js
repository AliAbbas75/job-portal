/** Route paths and builders, so links never hard-code URLs. */
export const paths = {
  home: '/',
  admin: '/admin',
  adminApprovals: '/admin/approvals',
  adminEditJob: (id = ':jobId') => `/admin/jobs/${id}/edit`,
  adminJob: (id = ':jobId') => `/admin/jobs/${id}`,
  adminLogin: '/admin/login',
  adminNewJob: '/admin/jobs/new',
  job: (id = ':jobId') => `/jobs/${id}`,
  applyCheck: (id = ':jobId') => `/jobs/${id}/apply`,
  applyReview: (id = ':jobId') => `/jobs/${id}/apply/review`,
  signup: '/signup',
  login: '/login',
  profile: '/profile',
  profileSection: (section) => `/profile?section=${section}`,
  applications: '/applications',
  application: (id = ':applicationId') => `/applications/${id}`,
};
