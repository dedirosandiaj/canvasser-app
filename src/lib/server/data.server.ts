/**
 * Server Data Functions
 * Uses SolidStart's cache() for SSR data fetching with automatic caching.
 * These functions run ONLY on the server.
 */

import { cache } from '@solidjs/router';
import { transactionApi, helpdeskApi, monitorApi } from './api.server';
import type { Terminal, Merchant, Transaction, Ticket, TransactionStats } from '~/types';

// ============================================================================
// TERMINALS
// ============================================================================

/**
 * Get paginated terminals list
 */
export const getTerminals = cache(async (page = 1, perPage = 10) => {
    'use server';
    try {
        const result = await transactionApi.getTerminals(page, perPage);
        return {
            data: result.data as Terminal[],
            meta: result.meta,
        };
    } catch (error) {
        console.error('[Server] Failed to fetch terminals:', error);
        return { data: [] as Terminal[], meta: { page: 1, per_page: 10, total: 0, total_pages: 0 } };
    }
}, 'terminals');

/**
 * Get terminal by ID
 */
export const getTerminalById = cache(async (id: string) => {
    'use server';
    try {
        const result = await transactionApi.getTerminalById(id);
        return result.data as Terminal;
    } catch (error) {
        console.error('[Server] Failed to fetch terminal:', error);
        return null;
    }
}, 'terminal-detail');

// ============================================================================
// MERCHANTS
// ============================================================================

/**
 * Get paginated merchants list
 */
export const getMerchants = cache(async (page = 1, perPage = 100, status = '') => {
    'use server';
    try {
        const result = await transactionApi.getMerchants(page, perPage, status);
        return {
            data: result.data as Merchant[],
            meta: result.meta,
        };
    } catch (error) {
        console.error('[Server] Failed to fetch merchants:', error);
        return { data: [] as Merchant[], meta: { page: 1, per_page: 100, total: 0, total_pages: 0 } };
    }
}, 'merchants');

/**
 * Get merchant by ID
 */
export const getMerchantById = cache(async (id: string) => {
    'use server';
    try {
        const result = await transactionApi.getMerchantById(id);
        return result.data as Merchant;
    } catch (error) {
        console.error('[Server] Failed to fetch merchant:', error);
        return null;
    }
}, 'merchant-detail');

// ============================================================================
// TRANSACTIONS
// ============================================================================

/**
 * Get paginated transactions list
 */
export const getTransactions = cache(async (page = 1, perPage = 10) => {
    'use server';
    try {
        const result = await transactionApi.getTransactions(page, perPage);
        return {
            data: result.data as Transaction[],
            meta: result.meta,
        };
    } catch (error) {
        console.error('[Server] Failed to fetch transactions:', error);
        return { data: [] as Transaction[], meta: { page: 1, per_page: 10, total: 0, total_pages: 0 } };
    }
}, 'transactions');

/**
 * Get transaction statistics
 */
export const getTransactionStats = cache(async () => {
    'use server';
    try {
        const result = await transactionApi.getTransactionStats();
        return result as TransactionStats;
    } catch (error) {
        console.error('[Server] Failed to fetch transaction stats:', error);
        return {
            total_transactions: 0,
            success_count: 0,
            failed_count: 0,
            success_rate: 0,
            total_amount: 0,
            avg_response_time: 0,
        } as TransactionStats;
    }
}, 'transaction-stats');

// ============================================================================
// DASHBOARD (Aggregated Data)
// ============================================================================

/**
 * Get dashboard data (aggregated from multiple services)
 */
export const getDashboardData = cache(async () => {
    'use server';
    try {
        const [terminalsRes, statsRes] = await Promise.allSettled([
            transactionApi.getTerminals(1, 5),
            transactionApi.getTransactionStats(),
        ]);

        const terminals = terminalsRes.status === 'fulfilled'
            ? (terminalsRes.value.data as Terminal[])
            : [];

        const stats = statsRes.status === 'fulfilled'
            ? (statsRes.value as TransactionStats)
            : {
                total_transactions: 0,
                success_count: 0,
                failed_count: 0,
                success_rate: 0,
                total_amount: 0,
                avg_response_time: 0,
            };

        return {
            stats,
            terminals,
            uptime: 99.8, // TODO: Get from monitor service
        };
    } catch (error) {
        console.error('[Server] Failed to fetch dashboard data:', error);
        return {
            stats: {
                total_transactions: 0,
                success_count: 0,
                failed_count: 0,
                success_rate: 0,
                total_amount: 0,
                avg_response_time: 0,
            },
            terminals: [],
            uptime: 0,
        };
    }
}, 'dashboard');

// ============================================================================
// HELPDESK
// ============================================================================

/**
 * Get paginated tickets list
 */
export const getTickets = cache(async (page = 1, perPage = 10) => {
    'use server';
    try {
        const result = await helpdeskApi.getTickets(page, perPage);
        return {
            data: result.data as Ticket[],
            meta: result.meta,
        };
    } catch (error) {
        console.error('[Server] Failed to fetch tickets:', error);
        return { data: [] as Ticket[], meta: { page: 1, per_page: 10, total: 0, total_pages: 0 } };
    }
}, 'tickets');

/**
 * Get ticket by ID
 */
export const getTicketById = cache(async (id: number) => {
    'use server';
    try {
        const result = await helpdeskApi.getTicketById(id);
        return result.data as Ticket;
    } catch (error) {
        console.error('[Server] Failed to fetch ticket:', error);
        return null;
    }
}, 'ticket-detail');

// ============================================================================
// REFERENCE DATA (for autocomplete - cached for long periods)
// ============================================================================

export interface RefInstitution {
    code: string;
    name: string;
    description?: string;
}

export interface RefCity {
    code: string;
    name: string;
    province_code: string;
    is_valid: boolean;
    province?: RefProvince;
}

export interface RefProvince {
    code: string;
    alpha_code: string;
    name: string;
}

export interface RefMCC {
    code: string;
    category_name: string;
    description?: string;
}

/**
 * Get all institutions (cached)
 */
export const getInstitutions = cache(async () => {
    'use server';
    try {
        const result = await transactionApi.getInstitutions();
        return { data: result.data as RefInstitution[] };
    } catch (error) {
        console.error('[Server] Failed to fetch institutions:', error);
        return { data: [] as RefInstitution[] };
    }
}, 'ref-institutions');

/**
 * Get all cities with provinces (cached)
 */
export const getCities = cache(async () => {
    'use server';
    try {
        const result = await transactionApi.getCities();
        return { data: result.data as RefCity[] };
    } catch (error) {
        console.error('[Server] Failed to fetch cities:', error);
        return { data: [] as RefCity[] };
    }
}, 'ref-cities');

/**
 * Get all MCCs (cached)
 */
export const getMCCs = cache(async () => {
    'use server';
    try {
        const result = await transactionApi.getMCCs();
        return { data: result.data as RefMCC[] };
    } catch (error) {
        console.error('[Server] Failed to fetch MCCs:', error);
        return { data: [] as RefMCC[] };
    }
}, 'ref-mccs');

/**
 * Get all provinces (cached)
 */
export const getProvinces = cache(async () => {
    'use server';
    try {
        const result = await transactionApi.getProvinces();
        return { data: result.data as RefProvince[] };
    } catch (error) {
        console.error('[Server] Failed to fetch provinces:', error);
        return { data: [] as RefProvince[] };
    }
}, 'ref-provinces');

export interface RefEDCType {
    id: number;
    brand: string;
    model: string;
    connection_type: string;
}

/**
 * Get all EDC Types (cached)
 */
export const getEDCTypes = cache(async () => {
    'use server';
    try {
        const result = await transactionApi.getEDCTypes();
        return { data: result.data as RefEDCType[] };
    } catch (error) {
        console.error('[Server] Failed to fetch EDC types:', error);
        return { data: [] as RefEDCType[] };
    }
}, 'ref-edc-types');

