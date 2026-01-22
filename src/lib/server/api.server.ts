/**
 * Server-Side API Client
 * This client runs ONLY on the server and calls Go microservices directly.
 * It uses non-VITE_ prefixed env vars that are not exposed to the browser.
 */

// Service URLs - server-side only (not exposed to browser)
const API_URL = process.env.API_URL || 'http://localhost:8004';
const AUTH_API_URL = process.env.AUTH_API_URL || 'http://localhost:8001';
const MONITOR_API_URL = process.env.MONITOR_API_URL || 'http://localhost:8002';
const HELPDESK_API_URL = process.env.HELPDESK_API_URL || 'http://localhost:8003';

/**
 * API Error class for server-side error handling
 */
export class ServerApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public data?: unknown
    ) {
        super(`Server API Error: ${status} ${statusText}`);
        this.name = 'ServerApiError';
    }
}

/**
 * Generic server-side fetch wrapper with optional auth token
 */
async function serverFetch<T>(
    baseUrl: string,
    endpoint: string,
    options: RequestInit = {},
    token?: string
): Promise<T> {
    const url = `${baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token is provided
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        // Clone response to allow reading body multiple times
        const text = await response.text();
        let errorData: unknown;
        try {
            errorData = JSON.parse(text);
        } catch {
            errorData = text;
        }
        throw new ServerApiError(response.status, response.statusText, errorData);
    }

    // Handle empty responses
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

/**
 * Transaction Service API
 */
export const transactionApi = {
    // Terminals
    getTerminals: (page = 1, perPage = 10) =>
        serverFetch<{ data: unknown[]; meta: PaginationMeta }>(
            API_URL,
            `/api/v1/terminals?page=${page}&per_page=${perPage}`
        ),

    getTerminalById: (id: string) =>
        serverFetch<{ data: unknown }>(API_URL, `/api/v1/terminals/${id}`),

    createTerminal: (data: CreateTerminalInput) =>
        serverFetch<{ data: unknown; message: string }>(API_URL, '/api/v1/terminals', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Merchants
    getMerchants: (page = 1, perPage = 10, status = '') =>
        serverFetch<{ data: unknown[]; meta: PaginationMeta }>(
            API_URL,
            `/api/v1/merchants?page=${page}&per_page=${perPage}&status=${status}`
        ),

    createMerchant: (data: unknown) =>
        serverFetch<{ data: unknown; message: string }>(API_URL, '/api/v1/merchants', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getMerchantById: (id: string) =>
        serverFetch<{ data: unknown }>(API_URL, `/api/v1/merchants/${id}`),

    updateMerchant: (id: string, data: unknown) =>
        serverFetch<{ data: unknown; message: string }>(API_URL, `/api/v1/merchants/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    approveMerchant: (id: string) =>
        serverFetch<{ message: string }>(API_URL, `/api/v1/merchants/${id}/approve`, {
            method: 'POST',
        }),

    rejectMerchant: (id: string, reason: string) =>
        serverFetch<{ message: string }>(API_URL, `/api/v1/merchants/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        }),

    createMerchantAccount: (merchantId: string, data: unknown) =>
        serverFetch<{ data: unknown; message: string }>(API_URL, `/api/v1/merchants/${merchantId}/accounts`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Transactions
    getTransactions: (page = 1, perPage = 10) =>
        serverFetch<{ data: unknown[]; meta: PaginationMeta }>(
            API_URL,
            `/api/v1/transactions?page=${page}&per_page=${perPage}`
        ),

    getTransactionStats: () =>
        serverFetch<unknown>(API_URL, '/api/v1/transactions/stats'),

    // Health
    checkHealth: () => serverFetch<{ status: string }>(API_URL, '/api/v1/health'),

    // Reference Data (for autocomplete)
    getInstitutions: () =>
        serverFetch<{ data: RefInstitution[] }>(API_URL, '/api/v1/reference/institutions'),
    getCities: () =>
        serverFetch<{ data: RefCity[] }>(API_URL, '/api/v1/reference/cities'),
    getMCCs: () =>
        serverFetch<{ data: RefMCC[] }>(API_URL, '/api/v1/reference/mccs'),
    getProvinces: () =>
        serverFetch<{ data: RefProvince[] }>(API_URL, '/api/v1/reference/provinces'),
    getEDCTypes: () =>
        serverFetch<{ data: RefEDCType[] }>(API_URL, '/api/v1/reference/edc-types'),
};

// Reference Data Types
interface RefInstitution {
    code: string;
    name: string;
    description?: string;
}

interface RefCity {
    code: string;
    name: string;
    province_code: string;
    is_valid: boolean;
    province?: RefProvince;
}

interface RefProvince {
    code: string;
    alpha_code: string;
    name: string;
}

interface RefMCC {
    code: string;
    category_name: string;
    description?: string;
}

interface RefEDCType {
    id: number;
    brand: string;
    model: string;
    connection_type: string;
}

/**
 * Monitor Service API
 */
export const monitorApi = {
    getStats: () => serverFetch<unknown>(MONITOR_API_URL, '/api/v1/stats'),
    getTerminalStats: () => serverFetch<unknown>(MONITOR_API_URL, '/api/v1/terminals/stats'),
};

/**
 * Helpdesk Service API
 */
export const helpdeskApi = {
    getTickets: (page = 1, perPage = 10, filters?: Record<string, string>) => {
        let queryParams = `page=${page}&per_page=${perPage}`;
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams += `&${key}=${encodeURIComponent(value)}`;
            });
        }
        return serverFetch<{ data: unknown[]; meta: PaginationMeta }>(
            HELPDESK_API_URL,
            `/api/v1/tickets?${queryParams}`
        );
    },

    getTicketById: (id: number) =>
        serverFetch<{ success: boolean; data: unknown }>(HELPDESK_API_URL, `/api/v1/tickets/${id}`),

    createTicket: (data: unknown) =>
        serverFetch<{ success: boolean; data: unknown }>(HELPDESK_API_URL, '/api/v1/tickets', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateTicket: (id: number, data: unknown) =>
        serverFetch<{ success: boolean; data: unknown }>(HELPDESK_API_URL, `/api/v1/tickets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    assignTicket: (id: number, assignedTo: string) =>
        serverFetch<{ success: boolean; data: unknown }>(HELPDESK_API_URL, `/api/v1/tickets/${id}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ assigned_to: assignedTo }),
        }),

    changeStatus: (id: number, status: string) =>
        serverFetch<{ success: boolean; data: unknown }>(HELPDESK_API_URL, `/api/v1/tickets/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),

    // Comments
    getComments: (ticketId: number) =>
        serverFetch<{ success: boolean; data: unknown[] }>(HELPDESK_API_URL, `/api/v1/tickets/${ticketId}/comments`),

    addComment: (ticketId: number, data: { content: string; is_internal?: boolean }) =>
        serverFetch<{ success: boolean; data: unknown }>(HELPDESK_API_URL, `/api/v1/tickets/${ticketId}/comments`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Activities
    getActivities: (ticketId: number) =>
        serverFetch<{ success: boolean; data: unknown[] }>(HELPDESK_API_URL, `/api/v1/tickets/${ticketId}/activities`),

    // Health
    checkHealth: () =>
        serverFetch<{ status: string; dependencies: Record<string, string> }>(HELPDESK_API_URL, '/api/v1/health'),
};

/**
 * Auth Service API
 */
export const authApi = {
    login: (credentials: { email: string; password: string }) =>
        serverFetch<{ token: string; user: unknown }>(AUTH_API_URL, '/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),

    me: (token: string) =>
        serverFetch<{ user: unknown }>(AUTH_API_URL, '/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
        }),
};

// Types
interface PaginationMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

interface CreateTerminalInput {
    merchant_id: string;
    edc_type_id: number;
    features?: Record<string, unknown>;
}
