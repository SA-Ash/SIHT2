import api from './api.js';

// Payments service for payment processing
export const paymentsService = {
  // Initiate payment (UPI or COD)
  initiatePayment: async (orderId, amount, method, upiId = null) => {
    const response = await api.post('/api/payments/initiate', {
      orderId,
      amount,
      method,
      upiId
    });
    return response.data;
  },

  // Verify payment status
  verifyPayment: async (paymentId, providerStatus) => {
    const response = await api.post('/api/payments/verify', {
      paymentId,
      providerStatus
    });
    return response.data;
  },

  // Get payment details
  getPayment: async (paymentId) => {
    const response = await api.get(`/api/payments/${paymentId}`);
    return response.data;
  },

  // Cancel payment
  cancelPayment: async (paymentId) => {
    const response = await api.post(`/api/payments/${paymentId}/cancel`);
    return response.data;
  },

  // Helper function to open UPI intent
  openUPIIntent: (upiIntent) => {
    if (upiIntent) {
      // For mobile devices, this will open the UPI app
      window.location.href = upiIntent;
    }
  },

  // Helper function to poll payment status (for UPI)
  pollPaymentStatus: async (paymentId, maxAttempts = 30, intervalMs = 2000) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const payment = await paymentsService.getPayment(paymentId);
        if (payment.status === 'paid' || payment.status === 'failed') {
          return payment;
        }
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      } catch (error) {
        console.error('Error polling payment status:', error);
        if (i === maxAttempts - 1) throw error;
      }
    }
    throw new Error('Payment status polling timeout');
  },
};
