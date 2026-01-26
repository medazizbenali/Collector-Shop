import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

// Microservices URLs
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8001';
const ARTICLES_URL = process.env.NEXT_PUBLIC_ARTICLES_URL || 'http://localhost:8002';
const ORDERS_URL = process.env.NEXT_PUBLIC_ORDERS_URL || 'http://localhost:8003';
const CART_URL = process.env.NEXT_PUBLIC_CART_URL || 'http://localhost:8004';
const SHOPS_URL = process.env.NEXT_PUBLIC_SHOPS_URL || 'http://localhost:8005';
const PAYMENT_URL = process.env.NEXT_PUBLIC_PAYMENT_URL || 'http://localhost:8006';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = ARTICLES_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          console.error('❌ [API] 401 Unauthorized:', {
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            method: error.config?.method,
            hasToken: !!Cookies.get('accessToken'),
          });

          // Only redirect if we're not already on the login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
            console.warn('⚠️ [API] Clearing token and redirecting to login');
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

// Auth Service client
export const authClient = new ApiClient(AUTH_URL).getClient();

// Articles Service client
export const articlesClient = new ApiClient(ARTICLES_URL).getClient();

// Orders Service client
export const ordersClient = new ApiClient(ORDERS_URL).getClient();

// Cart Service client
export const cartClient = new ApiClient(CART_URL).getClient();

// Shops Service client
export const shopsClient = new ApiClient(SHOPS_URL).getClient();

// Payment Service client
export const paymentClient = new ApiClient(PAYMENT_URL).getClient();
