/** Route paths and builders, so links never hard-code URLs. */
export const paths = {
  home: '/',
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
