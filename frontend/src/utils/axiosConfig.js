import axios from 'axios';

// In Vite development we sometimes see the dev server return 404 before
// the backend is available through the proxy. Use the backend origin when
// running in development so requests go directly to Laravel. In production
// keep the relative `/api` path which is mounted by the server.
const baseURL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
  ? 'http://127.0.0.1:8000'
  : '';

const instance = axios.create({
  baseURL,
  withCredentials: true, // Required for Sanctum cookie-based auth
  timeout: 60000, // 60 second timeout - increased for delete operations
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Ensure all requests have /api prefix and proper headers
instance.interceptors.request.use(
  (config) => {
    // Don't modify URLs that are already absolute
    if (!config.url.startsWith('http://') && !config.url.startsWith('https://')) {
      // Add /api prefix if not already present, but skip /sanctum URLs
      if (!config.url.startsWith('/api/') && !config.url.startsWith('/sanctum')) {
        config.url = '/api' + (config.url.startsWith('/') ? config.url : '/' + config.url);
      }
    }

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    // Handle FormData uploads - let axios set the Content-Type automatically
    if (config.data instanceof FormData) {
      // Remove the default Content-Type header to let axios set multipart/form-data with boundary
      delete config.headers['Content-Type'];
    }

    // Log request for debugging
    console.debug('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      isFormData: config.data instanceof FormData
    });

    return config;
  },
  (error) => Promise.reject(error)
);

// Retry configuration for network and timeout errors
const retryConfig = {
  retries: 1, // Retry once for transient errors
  retryDelay: (retryCount) => 1000, // 1 second delay for retry
  retryCondition: (error) => {
    // Retry on network errors and timeout errors (ECONNABORTED)
    // Don't retry on server errors (4xx, 5xx) or canceled requests
    return !error.response && (
      error.code === 'NETWORK_ERROR' || 
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout')
    );
  }
};

// Handle response interceptors with retry logic
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      return Promise.reject(error);
    }

    // Implement retry logic for network errors
    if (retryConfig.retryCondition(error) && config && !config._retry) {
      config._retry = true;
      config._retryCount = (config._retryCount || 0) + 1;
      
      if (config._retryCount <= retryConfig.retries) {
        const delay = retryConfig.retryDelay(config._retryCount);
        console.warn(`API request failed, retrying in ${delay}ms (attempt ${config._retryCount}/${retryConfig.retries}):`, {
          url: config.url,
          method: config.method,
          error: error.message
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return instance(config);
      }
    }

    // Suppress canceled requests noise (often triggered by component remounts/StrictMode)
    if (axios.isCancel?.(error) || error.code === 'ERR_CANCELED' || error.message === 'canceled' || error.name === 'CanceledError') {
      // Silently ignore
      return Promise.reject(error);
    }

    // Suppress or reduce logging for timeout errors (they're often transient)
    const isTimeoutError = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    
    // Log errors for debugging (only log non-retryable errors and non-timeout errors)
    // Timeout errors are logged at debug level to reduce console noise
    if (!config?._retry || config._retryCount > retryConfig.retries) {
      if (isTimeoutError) {
        // Log timeout errors at debug level only (less verbose)
        console.debug('API Timeout:', {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout,
          message: error.message
        });
      } else {
        // Log other errors normally
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
    }

    return Promise.reject(error);
  }
);

export default instance;