import api from '../api/axios';

const loanService = {
  getAll: () => api.get('/loans'),
  getById: (id) => api.get(`/loans/${id}`),
  create: (data) => api.post('/loans', data),
  payEmi: (paymentId, paymentDate) => api.post(`/loans/payment/${paymentId}`, { payment_date: paymentDate }),
  delete: (id) => api.delete(`/loans/${id}`)
};

export default loanService;
