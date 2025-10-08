# Frontend-Backend Integration Guide

This guide explains how the React frontend integrates with the Node.js microservices backend.

## Quick Start

### 1. Start the Backend
```bash
cd Backend
docker compose up --build
```

### 2. Start the Frontend
```bash
cd Frontend
npm install
npm run dev
```

### 3. Test Integration
- Open http://localhost:5173
- Navigate to the ExampleUsage component to test API calls
- Check browser console for API responses

## Architecture

```
Frontend (React + Vite)
    ↓ HTTP/HTTPS
API Gateway (Port 4000)
    ↓ Proxy
Microservices:
- Auth Service (4001)
- Orders Service (4002) 
- Shops Service (4003)
- Discovery Service (4004)
- Analytics Service (4005)
- Payments Service (4006)
```

## Environment Configuration

Create `.env.local` in the Frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:4000

# Development Settings
VITE_APP_ENV=development
VITE_DEBUG=true

# Feature flags
VITE_ENABLE_UPI_PAYMENTS=true
VITE_ENABLE_COD_PAYMENTS=true
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_COLLEGE_AUTH=true

# Map settings
VITE_DEFAULT_MAP_CENTER_LAT=28.6139
VITE_DEFAULT_MAP_CENTER_LNG=77.2090
VITE_DEFAULT_SEARCH_RADIUS=5000
```

## Service Integration

### Authentication Service
```javascript
import { authService } from './services/auth.js';

// Phone OTP Login
await authService.initiatePhoneOTP('+919876543210');
await authService.verifyPhoneOTP('+919876543210', '123456');

// Google Auth
await authService.googleAuth('dev:googleId:email:name');

// College Auth
await authService.initiateCollegeAuth('student@university.edu');
await authService.verifyCollegeAuth('student@university.edu', '123456');

// Logout
await authService.logout();
```

### Orders Service
```javascript
import { ordersService } from './services/orders.js';

// Create order
const order = await ordersService.createOrder({
  shopId: 'shopId',
  fileUrl: 'https://example.com/file.pdf',
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

// Get user orders
const orders = await ordersService.getUserOrders(userId);

// Update order status (shop/admin only)
await ordersService.updateOrderStatus(orderId, 'completed');
```

### Shops Service
```javascript
import { shopsService } from './services/shops.js';

// Find nearby shops
const shops = await shopsService.getNearbyShops(77.2090, 28.6139, 5000);

// Get shop details
const shop = await shopsService.getShop(shopId);

// Register shop (shop/admin only)
await shopsService.registerShop({
  name: 'Print Shop',
  location: {
    type: 'Point',
    coordinates: [77.2090, 28.6139]
  },
  address: '123 Main St',
  contact: '+919876543210'
});
```

### Discovery Service
```javascript
import { discoveryService } from './services/discovery.js';

// Find optimal shop
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
```

### Payments Service
```javascript
import { paymentsService } from './services/payments.js';

// UPI Payment
const payment = await paymentsService.initiatePayment(
  orderId,
  50.00,
  'upi',
  'user@paytm' // optional UPI ID
);

// Open UPI app
paymentsService.openUPIIntent(payment.upiIntent);

// Poll for payment status
const finalPayment = await paymentsService.pollPaymentStatus(payment.paymentId);

// COD Payment
await paymentsService.initiatePayment(orderId, 50.00, 'cod');
```

### Analytics Service (Admin Only)
```javascript
import { analyticsService } from './services/analytics.js';

// Get platform overview
const overview = await analyticsService.getOverview();

// Get order statistics
const orderStats = await analyticsService.getOrderStatistics();

// Get user statistics
const userStats = await analyticsService.getUserStatistics();
```

## Authentication Flow

### 1. Login
```javascript
import { useAuth } from './hooks/useAuth.js';

const { login, user, isAuthenticated } = useAuth();

// Phone OTP
await login({
  type: 'phone',
  step: 'initiate',
  phone: '+919876543210'
});

await login({
  type: 'phone',
  step: 'verify',
  phone: '+919876543210',
  code: '123456'
});
```

### 2. Protected Routes
```javascript
import ProtectedRoute from './components/ProtectedRoute.jsx';

<ProtectedRoute requiredRole="client">
  <StudentDashboard />
</ProtectedRoute>

<ProtectedRoute requiredRole="shop">
  <PartnerDashboard />
</ProtectedRoute>

<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### 3. Token Management
- Access tokens are automatically added to API requests
- Refresh tokens are used to get new access tokens
- Tokens are stored in localStorage
- Automatic logout on token expiration

## Error Handling

```javascript
import { handleApiError, showError } from './utils/errorHandler.js';

try {
  await ordersService.createOrder(orderData);
} catch (error) {
  const errorInfo = handleApiError(error);
  showError(error);
  
  // Handle specific error types
  if (errorInfo.type === 'auth') {
    // Redirect to login
  } else if (errorInfo.type === 'validation') {
    // Show validation errors
  }
}
```

## Development Tips

### 1. Testing API Calls
- Use the ExampleUsage component to test all endpoints
- Check browser Network tab for API requests
- Use browser console to see API responses

### 2. Mock Data
- For development, use the dev Google auth: `dev:googleId:email:name`
- For UPI payments, use `dev:paid` as verification status
- Phone OTP codes are logged to console in dev mode

### 3. Environment Variables
- All environment variables must start with `VITE_`
- Use `.env.local` for local development
- Use `.env.production` for production builds

### 4. CORS
- Backend services allow all origins in development
- Configure specific origins for production

## Production Deployment

### 1. Environment Variables
```env
VITE_API_BASE_URL=https://api.quickprint.com
VITE_APP_ENV=production
VITE_DEBUG=false
```

### 2. Build
```bash
npm run build
```

### 3. Deploy
- Deploy the `dist` folder to your hosting service
- Ensure HTTPS is enabled
- Configure proper CORS origins

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend is running
   - Check API_BASE_URL in environment variables

2. **Authentication Errors**
   - Check if tokens are stored in localStorage
   - Verify JWT_SECRET matches across services

3. **Network Errors**
   - Check if all backend services are running
   - Verify API Gateway is accessible

4. **Permission Errors**
   - Ensure user has correct role for the action
   - Check if user is properly authenticated

### Debug Mode
Set `VITE_DEBUG=true` to see detailed API logs in console.
