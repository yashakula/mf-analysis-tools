import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fundApi = {
  // Get all available funds
  getAllFunds: async () => {
    const response = await api.get('/funds');
    return response.data;
  },

  // Get details for a specific fund
  getFundDetails: async (fundId) => {
    const response = await api.get(`/fund/${fundId}`);
    return response.data;
  },

  // Compare two funds
  compareFunds: async (fund1Id, fund2Id) => {
    const response = await api.post('/compare', {
      fund1_id: fund1Id,
      fund2_id: fund2Id,
    });
    return response.data;
  },

  // Upload fund CSV
  uploadFund: async (file, fundName) => {
    const formData = new FormData();
    formData.append('file', file);
    if (fundName) {
      formData.append('fund_name', fundName);
    }

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get storage info
  getStorageInfo: async () => {
    const response = await api.get('/storage/info');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
