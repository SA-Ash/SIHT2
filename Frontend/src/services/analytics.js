import api from './api.js';

export const analyticsService = {
  getOverview: async () => {
    const response = await api.get('/api/admin/statistics/overview');
    return response.data;
  },

  getOrderStatistics: async () => {
    const response = await api.get('/api/admin/statistics/orders');
    return response.data;
  },

  getUserStatistics: async () => {
    const response = await api.get('/api/admin/statistics/users');
    return response.data;
  },
  getShopStatistics: async () => {
    const response = await api.get('/api/admin/statistics/shops');
    return response.data;
  },

  getConsumptionStatistics: async () => {
    const response = await api.get('/api/admin/statistics/consumption');
    return response.data;
  },
};
