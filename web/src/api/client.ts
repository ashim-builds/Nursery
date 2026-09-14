import axios from 'axios';

// Using relative '/api' routes requests through Vite dev proxy or production reverse-proxy seamlessly
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// In-memory runtime token store (Zero localStorage)
let inMemoryAccessToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAuthToken = (): string | null => {
  return inMemoryAccessToken;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Automatically sends HTTP-only auth & session cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach in-memory JWT token and cache-busting headers for GET requests
apiClient.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }

    // Respect explicit noCache / _t params if provided, but do not bust cache indiscriminately on catalog/product GET requests
    if (config.params?.noCache) {
      const { noCache, ...restParams } = config.params;
      config.params = {
        ...restParams,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401s and format timeouts gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = 'The server took too long to respond. Please check your connection and try again.';
    }

    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (
        !url.includes('/auth/login') &&
        !url.includes('/auth/register') &&
        !url.includes('/auth/admin-login')
      ) {
        setAuthToken(null);
      }
    }
    return Promise.reject(error);
  }
);

