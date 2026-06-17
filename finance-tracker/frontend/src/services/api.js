const API_URL = 'http://localhost:5050/api';

// Helper to get headers with token
const getHeaders = (isCsv = false) => {
  const headers = {};
  if (!isCsv) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Response helper
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const data = await response.json();
      errorMessage = data.message || errorMessage;
    } catch (e) {
      // If it's not JSON
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const api = {
  // Auth endpoints
  auth: {
    register: async (name, email, password) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, password })
      });
      return handleResponse(res);
    },
    login: async (email, password) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Transactions endpoints
  transactions: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          query.append(key, params[key]);
        }
      });
      const res = await fetch(`${API_URL}/transactions?${query.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    add: async (data) => {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getExportUrl: (params = {}) => {
      const query = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          query.append(key, params[key]);
        }
      });
      return `${API_URL}/transactions/export?${query.toString()}`;
    }
  },

  // Budgets endpoints
  budgets: {
    getAll: async (month) => {
      const query = month ? `?month=${month}` : '';
      const res = await fetch(`${API_URL}/budgets${query}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    upsert: async (data) => {
      const res = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Dashboard endpoints
  dashboard: {
    getSummary: async () => {
      const res = await fetch(`${API_URL}/dashboard/summary`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getCharts: async () => {
      const res = await fetch(`${API_URL}/dashboard/charts`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getInsights: async () => {
      const res = await fetch(`${API_URL}/dashboard/insights`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getNotifications: async () => {
      const res = await fetch(`${API_URL}/dashboard/notifications`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    readAllNotifications: async () => {
      const res = await fetch(`${API_URL}/dashboard/notifications/read-all`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Profile endpoints
  profile: {
    getSummary: async () => {
      const res = await fetch(`${API_URL}/profile/summary`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    update: async (data) => {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    changePassword: async (data) => {
      const res = await fetch(`${API_URL}/profile/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    deleteAccount: async () => {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  }
};
