/**
 * Centralized API Client
 * Handles all HTTP requests with JWT injection and error handling
 */

import { getAuthToken } from '~/stores/auth';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8004';

/**
 * API Error class for standardized error handling
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public data?: unknown
    ) {
        super(`API Error: ${status} ${statusText}`);
        this.name = 'ApiError';
    }
}

/**
 * Request options extending fetch RequestInit
 */
interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(endpoint, API_BASE_URL);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.append(key, String(value));
            }
        });
    }

    return url.toString();
}

/**
 * Core fetch wrapper with interceptors
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, params, headers: customHeaders, ...fetchOptions } = options;

    // Build headers with JWT injection
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...customHeaders,
    };

    // Inject JWT token if available (Hybrid approach: use header if token exists in store, else rely on cookie)
    const token = getAuthToken();
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Build request
    const config: RequestInit = {
        ...fetchOptions,
        headers,
        credentials: 'include', // Ensure cookies are sent
    };

    // Add body if present
    if (body) {
        config.body = JSON.stringify(body);
    }

    // Make request
    const url = buildUrl(endpoint, params);
    const response = await fetch(url, config);

    // Handle response
    if (!response.ok) {
        let errorData: unknown;
        try {
            errorData = await response.json();
        } catch {
            errorData = await response.text();
        }
        throw new ApiError(response.status, response.statusText, errorData);
    }

    // Parse JSON response
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

/**
 * API Client with typed methods
 */
export const api = {
    /**
     * GET request
     */
    get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
        return request<T>(endpoint, { method: 'GET', params });
    },

    /**
     * POST request
     */
    post<T>(endpoint: string, body?: unknown): Promise<T> {
        return request<T>(endpoint, { method: 'POST', body });
    },

    /**
     * PUT request
     */
    put<T>(endpoint: string, body?: unknown): Promise<T> {
        return request<T>(endpoint, { method: 'PUT', body });
    },

    /**
     * PATCH request
     */
    patch<T>(endpoint: string, body?: unknown): Promise<T> {
        return request<T>(endpoint, { method: 'PATCH', body });
    },

    /**
     * DELETE request
     */
    delete<T>(endpoint: string): Promise<T> {
        return request<T>(endpoint, { method: 'DELETE' });
    },
};

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

export default api;
