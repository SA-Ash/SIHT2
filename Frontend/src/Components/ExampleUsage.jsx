import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { authService } from '../services/auth.js';
import { ordersService } from '../services/orders.js';
import { shopsService } from '../services/shops.js';
import { discoveryService } from '../services/discovery.js';
import { paymentsService } from '../services/payments.js';
import { analyticsService } from '../services/analytics.js';
import { handleApiError, showError, showSuccess } from '../utils/errorHandler.js';

// Example component showing how to use all the services
const ExampleUsage = () => {
  const { user, login, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  // Example: Phone OTP Login
  const handlePhoneLogin = async () => {
    try {
      setLoading(true);
      
      // Step 1: Initiate OTP
      await authService.initiatePhoneOTP('+919876543210');
      showSuccess('OTP sent to your phone');
      
      // Step 2: Verify OTP (in real app, get code from user input)
      const result = await authService.verifyPhoneOTP('+919876543210', '123456');
      showSuccess('Login successful!');
      
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  // Example: Find nearby shops
  const handleFindShops = async () => {
    try {
      setLoading(true);
      const shops = await shopsService.getNearbyShops(77.2090, 28.6139, 5000);
      console.log('Nearby shops:', shops);
      showSuccess(`Found ${shops.length} shops nearby`);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  // Example: Find optimal shop
  const handleFindOptimalShop = async () => {
    try {
      setLoading(true);
      const result = await discoveryService.findOptimalShop(
        [77.2090, 28.6139], // user location
        {
          pages: 10,
          color: true,
          doubleSided: false,
          copies: 1,
          paperSize: 'A4',
          paperType: 'standard'
        },
        5 // radius in km
      );
      console.log('Optimal shop:', result);
      showSuccess('Found optimal shop!');
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  // Example: Create order
  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      const order = await ordersService.createOrder({
        shopId: '60f7b3b3b3b3b3b3b3b3b3b3',
        fileUrl: 'https://example.com/document.pdf',
        printConfig: {
          pages: 10,
          color: true,
          doubleSided: false,
          copies: 1,
          paperSize: 'A4',
          paperType: 'standard'
        },
        college: 'IIT Delhi'
      });
      console.log('Order created:', order);
      showSuccess('Order created successfully!');
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  // Example: UPI Payment
  const handleUPIPayment = async () => {
    try {
      setLoading(true);
      const payment = await paymentsService.initiatePayment(
        '60f7b3b3b3b3b3b3b3b3b3b3', // orderId
        50.00, // amount
        'upi',
        'user@paytm' // upiId (optional)
      );
      
      if (payment.upiIntent) {
        // Open UPI app
        paymentsService.openUPIIntent(payment.upiIntent);
        
        // Poll for payment status
        const finalPayment = await paymentsService.pollPaymentStatus(payment.paymentId);
        showSuccess(`Payment ${finalPayment.status}!`);
      }
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  // Example: Get analytics (admin only)
  const handleGetAnalytics = async () => {
    try {
      setLoading(true);
      const overview = await analyticsService.getOverview();
      console.log('Platform overview:', overview);
      showSuccess('Analytics loaded!');
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">QuickPrint API Integration Examples</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Current User</h2>
        {user ? (
          <div className="bg-green-100 p-4 rounded">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
            <p><strong>Email:</strong> {user.email || 'N/A'}</p>
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded">
            <p>Not logged in</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handlePhoneLogin}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Phone OTP Login'}
        </button>

        <button
          onClick={handleFindShops}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Find Nearby Shops'}
        </button>

        <button
          onClick={handleFindOptimalShop}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Find Optimal Shop'}
        </button>

        <button
          onClick={handleCreateOrder}
          disabled={loading || !user}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Create Order'}
        </button>

        <button
          onClick={handleUPIPayment}
          disabled={loading || !user}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'UPI Payment'}
        </button>

        <button
          onClick={handleGetAnalytics}
          disabled={loading || user?.role !== 'admin'}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Analytics (Admin)'}
        </button>

        <button
          onClick={logout}
          disabled={loading || !user}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Logout
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
        <div className="bg-gray-100 p-4 rounded text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>Start the backend: <code>cd Backend && docker compose up --build</code></li>
            <li>Start the frontend: <code>cd Frontend && npm run dev</code></li>
            <li>Click "Phone OTP Login" to authenticate (use any phone number)</li>
            <li>Try other buttons to test different API endpoints</li>
            <li>Check browser console for detailed API responses</li>
            <li>For UPI payment, use "dev:paid" as the verification code</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ExampleUsage;
