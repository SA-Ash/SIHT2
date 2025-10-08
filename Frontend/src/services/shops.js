import api from './api.js';

// Shops service for shop management and discovery endpoints
export const shopsService = {
  // Register new shop (shop/admin only)
  registerShop: async (shopData) => {
    const response = await api.post('/api/shops/register', shopData);
    return response.data;
  },

  // Find nearby shops
  getNearbyShops: async (lng, lat, radius = 5000) => {
    const response = await api.get('/api/shops/nearby', {
      params: { lng, lat, radius }
    });
    return response.data;
  },

  // Get shop details
  getShop: async (shopId) => {
    const response = await api.get(`/api/shops/${shopId}`);
    return response.data;
  },

  // Update shop capacity (shop owner/admin only)
  updateShopCapacity: async (shopId, capacityData) => {
    const response = await api.put(`/api/shops/${shopId}/capacity`, capacityData);
    return response.data;
  },

  // Update shop status (shop owner/admin only)
  updateShopStatus: async (shopId, isActive) => {
    const response = await api.put(`/api/shops/${shopId}/status`, { isActive });
    return response.data;
  },

  // Get shop orders (via orders service)
  getShopOrders: async (shopId) => {
    const response = await api.get(`/api/orders/shop/${shopId}`);
    return response.data;
  },
};
