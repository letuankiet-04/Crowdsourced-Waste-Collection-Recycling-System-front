export const PATHS = {
  home: '/home',
  dev: {
    apiTest: '/api-test',
  },
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
  },
  citizen: {
    dashboard: '/citizen/dashboard',
    createReport: '/create-report',
    reports: '/citizen/reports',
    reportDetail: '/citizen/reports/:reportId',
  },
  collector: {
    dashboard: '/collector/dashboard',
    tasks: '/collector/tasks',
    history: '/collector/history',
    profile: '/collector/profile',
    reportDetail: '/collector/reports/:reportId',
  },
  enterprise: {
    dashboard: '/enterprise/dashboard',
    reports: '/enterprise/reports',
    reportDetail: '/enterprise/reports/:reportId',
    rewards: '/enterprise/rewards',
    map: '/enterprise/map',
    profile: '/enterprise/profile',
    adminPanel: '/enterprise/admin',
    settings: '/enterprise/settings',
  },
  admin: {
    dashboard: '/admin/dashboard',
    reportDetail: '/admin/reports/:reportId',
  },
  unauthorized: '/unauthorized',
  contact: '/home#contact',
}

