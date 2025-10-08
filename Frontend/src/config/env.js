// Environment configuration
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  
  // Development Settings
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
  
  // Optional: Override individual service URLs for development
  AUTH_SERVICE_URL: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:4001',
  ORDERS_SERVICE_URL: import.meta.env.VITE_ORDERS_SERVICE_URL || 'http://localhost:4002',
  SHOPS_SERVICE_URL: import.meta.env.VITE_SHOPS_SERVICE_URL || 'http://localhost:4003',
  DISCOVERY_SERVICE_URL: import.meta.env.VITE_DISCOVERY_SERVICE_URL || 'http://localhost:4004',
  ANALYTICS_SERVICE_URL: import.meta.env.VITE_ANALYTICS_SERVICE_URL || 'http://localhost:4005',
  PAYMENTS_SERVICE_URL: import.meta.env.VITE_PAYMENTS_SERVICE_URL || 'http://localhost:4006',
  
  // Feature flags
  ENABLE_UPI_PAYMENTS: import.meta.env.VITE_ENABLE_UPI_PAYMENTS !== 'false',
  ENABLE_COD_PAYMENTS: import.meta.env.VITE_ENABLE_COD_PAYMENTS !== 'false',
  ENABLE_GOOGLE_AUTH: import.meta.env.VITE_ENABLE_GOOGLE_AUTH !== 'false',
  ENABLE_COLLEGE_AUTH: import.meta.env.VITE_ENABLE_COLLEGE_AUTH !== 'false',
  
  // Map settings
  DEFAULT_MAP_CENTER_LAT: parseFloat(import.meta.env.VITE_DEFAULT_MAP_CENTER_LAT) || 28.6139,
  DEFAULT_MAP_CENTER_LNG: parseFloat(import.meta.env.VITE_DEFAULT_MAP_CENTER_LNG) || 77.2090,
  DEFAULT_SEARCH_RADIUS: parseInt(import.meta.env.VITE_DEFAULT_SEARCH_RADIUS) || 5000,
};

// Log configuration in development
if (config.DEBUG) {
  console.log('QuickPrint Config:', config);
}
