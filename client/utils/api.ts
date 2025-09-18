import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retryCount?: number;
  }
  export interface InternalAxiosRequestConfig {
    _retryCount?: number;
  }
}

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import Router from 'next/router';

const API_BASE = 'https://face-forward.onrender.com';
const REQUEST_TIMEOUT = 15000; // ms
const GET_MAX_RETRIES = 2; // number of GET retries on transient errors

const TOKEN_KEY = 'token';

/** Helpers to get/set access token (client-only) */
export const getLocalAccessToken = (): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setLocalAccessToken = (token?: string | null): void => {
  try {
    if (typeof window === 'undefined') return;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
};

export const clearLocalAccessToken = (): void => setLocalAccessToken(null);

/** Create axios instance */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // keep this if you use cookie-based auth for other endpoints
  timeout: REQUEST_TIMEOUT,
});

/** Request interceptor: attach access token and default headers for mutating requests */
api.interceptors.request.use(
  (config) => {
    const token = getLocalAccessToken();
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const method = (config.method || '').toLowerCase();
    if (['post', 'put', 'patch'].includes(method)) {
      config.headers = config.headers || {};
      if (!(config.headers as any)['Content-Type'] && !(config.headers as any)['content-type']) {
        (config.headers as any)['Content-Type'] = 'application/json';
      }
    }

    // initialize _retryCount used for GET retry bookkeeping
    config._retryCount = config._retryCount || 0;

    return config;
  },
  (err) => Promise.reject(err)
);

/** helper: sleep */
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** helper: determine whether an error is transient/retryable (network / 502/503/504) */
const isRetryableError = (err: any): boolean => {
  if (!err || !err.config) return false;
  if (!err.response) return true; // network error
  const status = err.response.status;
  return [502, 503, 504].includes(status);
};

/** Response interceptor: handles 401 by clearing token + redirect; retries GET on transient errors */
api.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError & { config?: AxiosRequestConfig }) => {
    const originalRequest = error?.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response ? error.response.status : null;

    // If unauthorized, clear token and redirect to login (no refresh logic)
    if (status === 401) {
      clearLocalAccessToken();
      if (typeof window !== 'undefined') {
        Router.push('/login');
      }
      return Promise.reject(error);
    }

    // Retry logic for GET requests only (idempotent)
    const method = (originalRequest.method || '').toLowerCase();
    if (
      method === 'get' &&
      isRetryableError(error) &&
      (originalRequest._retryCount || 0) < GET_MAX_RETRIES
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      const backoffMs = Math.pow(2, originalRequest._retryCount - 1) * 1000; // 1s, 2s ...
      await sleep(backoffMs);
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
