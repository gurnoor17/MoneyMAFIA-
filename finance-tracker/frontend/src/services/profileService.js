import api from '../api/axios';

const profileService = {
  getSummary: () => api.get('/profile/summary'),
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/change-password', data),
  deleteAccount: () => api.delete('/profile')
};

export default profileService;
