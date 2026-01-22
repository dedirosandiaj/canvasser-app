/**
 * Server Actions
 * Mutations that run on the server for POST/PUT/DELETE operations.
 */

import { action, revalidate, redirect } from '@solidjs/router';
import { transactionApi, helpdeskApi } from './api.server';

// Auth Service Base URL
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';

// ============================================================================
// AUTH ACTIONS (Server-Side for Security)
// ============================================================================

/**
 * Login Action - credentials are processed server-side, not visible in browser
 */
export async function loginAction(email: string, password: string) {
    'use server';

    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            return { success: false, error: error.message || 'Invalid credentials' };
        }

        const data = await response.json();

        // Extract Set-Cookie headers for session management
        const setCookieHeader = response.headers.get('set-cookie');

        return {
            success: true,
            data: data.user,
            token: data.token, // Also return token for client-side storage
            cookies: setCookieHeader // Pass cookies to client for setting
        };
    } catch (error) {
        console.error('[Server] Login error:', error);
        return { success: false, error: 'Failed to connect to auth service' };
    }
}

/**
 * Logout Action - clears session server-side
 */
export async function logoutAction() {
    'use server';

    try {
        // Note: In a real implementation, you'd pass the session token to invalidate
        await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        return { success: true };
    } catch (error) {
        console.error('[Server] Logout error:', error);
        return { success: false, error: 'Failed to logout' };
    }
}

/**
 * Get Current User from token/session
 */
export async function getCurrentUser(token?: string) {
    'use server';

    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/me`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.user || data;
    } catch (error) {
        console.error('[Server] Get user error:', error);
        return null;
    }
}
// TERMINAL ACTIONS
// ============================================================================

/**
 * Register a new terminal
 */
export const registerTerminalAction = action(async (formData: FormData) => {
    'use server';

    const merchantId = formData.get('merchant_id') as string;
    const edcTypeId = parseInt(formData.get('edc_type_id') as string) || 1;
    const features = formData.get('features') as string;

    if (!merchantId) {
        return { success: false, error: 'Merchant ID is required' };
    }

    try {
        const result = await transactionApi.createTerminal({
            merchant_id: merchantId,
            edc_type_id: edcTypeId,
            features: features ? JSON.parse(features) : {},
        });

        // Revalidate terminals cache
        revalidate('terminals');

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Server] Failed to register terminal:', error);
        return { success: false, error: 'Failed to register terminal' };
    }
}, 'register-terminal');

/**
 * Register terminal with JSON data (for programmatic use)
 */
export async function registerTerminal(data: {
    merchantId: string;
    edcTypeId?: number;
    features?: Record<string, unknown>;
}) {
    'use server';

    try {
        const result = await transactionApi.createTerminal({
            merchant_id: data.merchantId,
            edc_type_id: data.edcTypeId || 1,
            features: data.features || {},
        });

        // Revalidate terminals cache
        revalidate('terminals');

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Server] Failed to register terminal:', error);
        return { success: false, error: 'Failed to register terminal' };
    }
}

// ============================================================================
// MERCHANT ACTIONS
// ============================================================================

/**
 * Register a new merchant
 */
export async function registerMerchant(data: {
    agentName: string;
    institutionCode: string;
    mccCode: string;
    cityCode: string;
    provinceCode?: string;
    corporateName?: string;
    ownerName?: string;
    ownerPhone?: string;
    address?: string;
    postalCode?: string;
    operationalHours?: string;
    businessSector?: string;
}) {
    'use server';

    try {
        const result = await transactionApi.createMerchant({
            agent_name: data.agentName,
            institution_code: data.institutionCode,
            mcc_code: data.mccCode,
            city_code: data.cityCode,
            province_code: data.provinceCode || '',
            corporate_name: data.corporateName || data.agentName,
            owner_name: data.ownerName || '',
            owner_phone: data.ownerPhone || '',
            address: data.address || '',
            postal_code: data.postalCode || '',
            operational_hours: data.operationalHours || '',
            business_sector: data.businessSector || '',
        });

        // Revalidate merchants cache
        revalidate('merchants');

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Server] Failed to register merchant:', error);
        return { success: false, error: 'Failed to register merchant' };
    }
}

/**
 * Update merchant details
 */
export async function updateMerchant(id: string, data: {
    agentName?: string;
    corporateName?: string;
    ownerName?: string;
    ownerPhone?: string;
    address?: string;
    operationalHours?: string;
    businessSector?: string;
}) {
    'use server';

    try {
        const result = await transactionApi.updateMerchant(id, {
            agent_name: data.agentName,
            corporate_name: data.corporateName,
            owner_name: data.ownerName,
            owner_phone: data.ownerPhone,
            address: data.address,
            operational_hours: data.operationalHours,
            business_sector: data.businessSector
        });

        // Revalidate merchant caches
        revalidate('merchants');
        revalidate('merchant-detail');

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Server] Failed to update merchant:', error);
        return { success: false, error: 'Failed to update merchant' };
    }
}

/**
 * Add a bank account to a merchant
 */
export async function addMerchantAccount(merchantId: string, data: {
    bankCode: string;
    accountNumber: string;
    accountHolderName: string;
    isPrimary?: boolean;
}) {
    'use server';

    try {
        const result = await transactionApi.createMerchantAccount(merchantId, {
            bank_code: data.bankCode,
            account_number: data.accountNumber,
            account_holder_name: data.accountHolderName,
            is_primary: data.isPrimary,
        });

        // Revalidate merchant caches
        revalidate('merchant-detail');

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Server] Failed to add merchant account:', error);
        return { success: false, error: 'Failed to add merchant account' };
    }
}

/**
 * Approve a merchant
 */
export async function approveMerchant(id: string) {
    'use server';

    try {
        await transactionApi.approveMerchant(id);
        revalidate('merchants');
        revalidate('merchant-detail');
        return { success: true };
    } catch (error) {
        console.error('[Server] Failed to approve merchant:', error);
        return { success: false, error: 'Failed to approve merchant' };
    }
}

/**
 * Reject a merchant
 */
export async function rejectMerchant(id: string, reason: string) {
    'use server';

    try {
        await transactionApi.rejectMerchant(id, reason);
        revalidate('merchants');
        revalidate('merchant-detail');
        return { success: true };
    } catch (error) {
        console.error('[Server] Failed to reject merchant:', error);
        return { success: false, error: 'Failed to reject merchant' };
    }
}

// ============================================================================
// TICKET ACTIONS
// ============================================================================

/**
 * Create a new ticket
 */
export async function createTicket(data: {
    title: string;
    description: string;
    priority: string;
    category: string;
    terminalId?: string;
    merchantId?: string;
}) {
    'use server';

    try {
        const result = await helpdeskApi.createTicket({
            title: data.title,
            description: data.description,
            priority: data.priority,
            category: data.category,
            terminal_id: data.terminalId,
            merchant_id: data.merchantId,
        });

        // Revalidate tickets cache
        revalidate('tickets');

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Server] Failed to create ticket:', error);
        return { success: false, error: 'Failed to create ticket' };
    }
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(id: number, status: string) {
    'use server';

    try {
        const result = await helpdeskApi.changeStatus(id, status);

        // Revalidate ticket caches
        revalidate('tickets');
        revalidate('ticket-detail');

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Server] Failed to update ticket:', error);
        return { success: false, error: 'Failed to update ticket' };
    }
}

/**
 * Assign a ticket to a user
 */
export async function assignTicket(id: number, assignedTo: string) {
    'use server';

    try {
        const result = await helpdeskApi.assignTicket(id, assignedTo);

        // Revalidate ticket caches
        revalidate('tickets');
        revalidate('ticket-detail');

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Server] Failed to assign ticket:', error);
        return { success: false, error: 'Failed to assign ticket' };
    }
}

/**
 * Add a comment to a ticket
 */
export async function addTicketComment(ticketId: number, content: string, isInternal: boolean = false) {
    'use server';

    try {
        const result = await helpdeskApi.addComment(ticketId, { content, is_internal: isInternal });

        // Revalidate ticket caches
        revalidate('ticket-detail');

        return { success: true, data: result.data };
    } catch (error) {
        console.error('[Server] Failed to add comment:', error);
        return { success: false, error: 'Failed to add comment' };
    }
}

