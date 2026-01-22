/**
 * API Endpoints
 * Centralized endpoint definitions for all backend services
 */

export const endpoints = {
    // Auth Service
    auth: {
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        refresh: '/api/auth/refresh',
        me: '/api/auth/me',
    },

    // Transaction Service
    transactions: {
        list: '/api/v1/transactions',
        detail: (id: number) => `/api/v1/transactions/${id}`,
        create: '/api/v1/transactions',
        stats: '/api/v1/transactions/stats',
    },

    // Merchant Service
    merchants: {
        list: '/api/v1/merchants',
        create: '/api/v1/merchants',
        detail: (id: string) => `/api/v1/merchants/${id}`,
    },

    // Terminal/Monitoring Service
    terminals: {
        list: '/api/v1/terminals',
        create: '/api/v1/terminals',
        detail: (id: string) => `/api/v1/terminals/${id}`,
        health: (id: string) => `/api/v1/terminals/${id}/health`,
        stats: '/api/v1/terminals/stats',
    },

    // Helpdesk Service
    tickets: {
        list: '/api/tickets',
        detail: (id: number) => `/api/tickets/${id}`,
        create: '/api/tickets',
        update: (id: number) => `/api/tickets/${id}`,
        activities: (id: number) => `/api/tickets/${id}/activities`,
        comments: (id: number) => `/api/tickets/${id}/comments`,
        addComment: (id: number) => `/api/tickets/${id}/comments`,
    },

    // WebSocket endpoints
    ws: {
        monitoring: '/ws/monitoring',
        notifications: '/ws/notifications',
    },
} as const;

export default endpoints;
