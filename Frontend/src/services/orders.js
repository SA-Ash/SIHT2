import api from './api.js';

// Orders service for order management endpoints
export const ordersService = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  // Get order details
  getOrder: async (orderId) => {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  },

  // Get current user's orders (for students)
  getMyOrders: async () => {
    const response = await api.get('/api/orders/my-orders');
    return response.data;
  },

  // Get user orders by ID
  getUserOrders: async (userId) => {
    const response = await api.get(`/api/orders/user/${userId}`);
    return response.data;
  },

  // Get partner orders (for partners)
  getPartnerOrders: async () => {
    const response = await api.get('/api/orders/partner-orders');
    return response.data;
  },

  // Update order status (shop/admin only)
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/api/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await api.post(`/api/orders/${orderId}/cancel`);
    return response.data;
  },

  // Get shop orders (shop/admin only)
  getShopOrders: async (shopId) => {
    const response = await api.get(`/api/orders/shop/${shopId}`);
    return response.data;
  },
};
