import api from '../api/axios';

const budgetService = {
  getAll: (month) => {
    const query = month ? `?month=${month}` : '';
    return api.get(`/budgets${query}`);
  },
  upsert: (data) => api.post('/budgets', data),
  delete: (id) => api.delete(`/budgets/${id}`)
};

export default budgetService;
