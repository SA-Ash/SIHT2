import api from './api.js';

// Discovery service for optimal shop finding
export const discoveryService = {
  // Find optimal shop for a print job
  findOptimalShop: async (userLocation, printJob, radiusKm = 5) => {
    const response = await api.post('/api/discovery/optimal-shop', {
      userLocation,
      printJob,
      radiusKm
    });
    return response.data;
  },
};
