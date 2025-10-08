# QuickPrint Frontend

A React-based frontend application for the QuickPrint platform that connects students with local print shops.

## Features

- **Authentication**: Phone OTP, Google OAuth, and College email authentication
- **Order Management**: Create, track, and manage print orders
- **Shop Discovery**: Find nearby shops and optimal printing locations
- **Payment Integration**: UPI and COD payment options
- **Admin Analytics**: Platform statistics and insights (admin only)
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live order status and notifications

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## Quick Start

### Prerequisites

- Node.js 18+ 
- Backend services running (see Backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update environment variables in `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_APP_ENV=development
VITE_DEBUG=true
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ExampleUsage.jsx # API integration examples
│   └── ProtectedRoute.jsx # Route protection
├── config/             # Configuration files
│   └── env.js         # Environment variables
├── hooks/              # Custom React hooks
│   └── useAuth.js     # Authentication hook
├── pages/              # Page components
│   ├── Home.jsx       # Landing page
│   └── Login.jsx      # Authentication page
├── routes/             # Route-specific components
│   ├── partner/       # Partner dashboard pages
│   └── student/       # Student dashboard pages
├── services/           # API service layers
│   ├── api.js         # Axios configuration
│   ├── auth.js        # Authentication API
│   ├── orders.js      # Orders API
│   ├── shops.js       # Shops API
│   ├── discovery.js   # Discovery API
│   ├── payments.js    # Payments API
│   └── analytics.js   # Analytics API
└── utils/              # Utility functions
    └── errorHandler.js # Error handling utilities
```

## API Integration

The frontend integrates with the backend microservices through a centralized API client:

### Authentication Flow

1. **Phone OTP**:
   ```javascript
   // Initiate OTP
   await authService.initiatePhoneOTP('+919876543210');
   
   // Verify OTP
   await authService.verifyPhoneOTP('+919876543210', '123456');
   ```

2. **Google Auth**:
   ```javascript
   await authService.googleAuth('dev:googleId:email:name');
   ```

3. **College Auth**:
   ```javascript
   // Initiate
   await authService.initiateCollegeAuth('student@university.edu');
   
   // Verify
   await authService.verifyCollegeAuth('student@university.edu', '123456');
   ```

### Order Management

```javascript
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
```

### Shop Discovery

```javascript
// Find nearby shops
const shops = await shopsService.getNearbyShops(77.2090, 28.6139, 5000);

// Find optimal shop
const result = await discoveryService.findOptimalShop(
  [77.2090, 28.6139], // user location
  printJob,
  5 // radius in km
);
```

### Payments

```javascript
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
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:4000` |
| `VITE_APP_ENV` | Application environment | `development` |
| `VITE_DEBUG` | Enable debug logging | `true` |
| `VITE_ENABLE_UPI_PAYMENTS` | Enable UPI payments | `true` |
| `VITE_ENABLE_COD_PAYMENTS` | Enable COD payments | `true` |
| `VITE_ENABLE_GOOGLE_AUTH` | Enable Google auth | `true` |
| `VITE_ENABLE_COLLEGE_AUTH` | Enable college auth | `true` |

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Testing API Integration

1. Start the backend services:
   ```bash
   cd ../Backend
   docker compose up --build
   ```

2. Navigate to the "Test API" section on the home page

3. Use the example buttons to test different API endpoints

4. Check browser console for detailed API responses

### Adding New API Endpoints

1. Add the endpoint to the appropriate service file in `src/services/`
2. Update the service with proper error handling
3. Use the service in your components
4. Test with the ExampleUsage component

## Production Deployment

### Build

```bash
npm run build
```

### Environment Variables

Set production environment variables:

```env
VITE_API_BASE_URL=https://api.quickprint.com
VITE_APP_ENV=production
VITE_DEBUG=false
```

### Deploy

Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.).

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend is running and CORS is configured
2. **Authentication Errors**: Check if tokens are stored in localStorage
3. **Network Errors**: Verify API_BASE_URL and backend connectivity
4. **Build Errors**: Check for missing environment variables

### Debug Mode

Set `VITE_DEBUG=true` to see detailed API logs in console.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.