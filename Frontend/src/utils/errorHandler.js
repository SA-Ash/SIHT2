// Error handling utilities
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          type: 'validation',
          message: data.error || 'Invalid request data',
          details: data.errors || null,
        };
      case 401:
        return {
          type: 'auth',
          message: 'Authentication required',
          details: null,
        };
      case 403:
        return {
          type: 'permission',
          message: 'You do not have permission to perform this action',
          details: null,
        };
      case 404:
        return {
          type: 'not_found',
          message: 'Resource not found',
          details: null,
        };
      case 500:
        return {
          type: 'server',
          message: 'Internal server error. Please try again later.',
          details: null,
        };
      default:
        return {
          type: 'unknown',
          message: data.error || 'An unexpected error occurred',
          details: null,
        };
    }
  } else if (error.request) {
    // Network error
    return {
      type: 'network',
      message: 'Unable to connect to server. Please check your internet connection.',
      details: null,
    };
  } else {
    // Other error
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred',
      details: null,
    };
  }
};

// Toast notification helper (you can integrate with your preferred toast library)
export const showError = (error) => {
  const errorInfo = handleApiError(error);
  console.error('API Error:', errorInfo);
  
  // You can integrate with toast libraries like react-hot-toast, react-toastify, etc.
  // For now, we'll use alert as a fallback
  alert(errorInfo.message);
};

// Success notification helper
export const showSuccess = (message) => {
  console.log('Success:', message);
  // You can integrate with toast libraries here
  alert(message);
};
