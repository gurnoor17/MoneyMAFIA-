import api from '../api/axios';

const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getCharts: () => api.get('/dashboard/charts'),
  getInsights: () => api.get('/dashboard/insights'),
  getNotifications: () => api.get('/dashboard/notifications'),
  readAllNotifications: () => api.put('/dashboard/notifications/read-all')
};

export default dashboardService;
