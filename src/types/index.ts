/**
 * Types Re-export
 * Re-exports shared types for easy importing in the frontend
 */

// Re-export all shared types from the shared directory
// Note: These types should match the Go structs in the backend services

export interface Merchant {
    id: string;
    mid: string;
    name?: string;
    agent_name?: string;
    corporate_name?: string;
    institution_id?: number;
    institution_code?: string;
    mcc_code?: string;
    business_sector?: string;
    owner_name?: string;
    owner_phone?: string;
    address?: string;
    city_code?: string;
    province_code?: string;
    postal_code?: string;
    operational_hours?: string;
    province_id?: number;
    city_id?: number;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'REJECTED';
    reject_reason?: string;
    created_at?: string;
    updated_at?: string;
    // Relations
    institution?: { id?: number; name: string; code: string };
    province?: { id?: number; code?: string; name: string };
    city?: { id?: number; code?: string; name: string };
    mcc?: { code: string; category_name: string; description?: string };
    accounts?: MerchantAccount[];
    terminals?: Terminal[];
}

export interface MerchantAccount {
    id?: string;
    merchant_id?: string;
    bank_code: string;
    account_number: string;
    account_holder_name: string;
    is_primary: boolean;
    bank?: { code: string; name: string; short_name?: string };
}

// Transaction types
export const TransactionStatus = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
} as const;
export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];

export const TransactionType = {
    PAYMENT: 'PAYMENT',
    TOPUP: 'TOPUP',
    TRANSFER: 'TRANSFER',
    WITHDRAWAL: 'WITHDRAWAL',
    REFUND: 'REFUND',
} as const;
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export interface Transaction {
    id: number;
    user_id: string;
    amount: number;
    status: TransactionStatus;
    type: TransactionType;
    reference_id?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface TransactionStats {
    total_transactions: number;
    success_count: number;
    failed_count: number;
    success_rate: number;
    total_amount: number;
    avg_response_time: number;
    active_terminals?: number;
    transactions_pm?: number;
    system_status?: SystemStatus;
    total_volume?: number;
    pending_count?: number;
}

export const SystemStatus = {
    HEALTHY: 'HEALTHY',
    DEGRADED: 'DEGRADED',
    OFFLINE: 'OFFLINE',
} as const;
export type SystemStatus = typeof SystemStatus[keyof typeof SystemStatus];

// Terminal types
export const TerminalStatus = {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE',
    LOW_PAPER: 'LOW_PAPER',
    MAINTENANCE: 'MAINTENANCE',
    ERROR: 'ERROR',
} as const;
export type TerminalStatus = typeof TerminalStatus[keyof typeof TerminalStatus];

export interface Terminal {
    id: string;
    tid?: string;
    merchant_id: string;
    merchant_name: string;
    status: TerminalStatus;
    last_seen: string;
    location?: TerminalLocation;
    uptime_percentage: number;
    paper_level?: number;
    cash_level?: number;
    firmware_version?: string;
    created_at?: string;
    updated_at?: string;
    // Relations
    merchant?: {
        id?: string;
        mid?: string;
        name?: string;
        agent_name?: string;
        corporate_name?: string;
        address?: string;
        city?: { name: string };
        province?: { name: string };
    };
    edc_type?: { id?: number; brand?: string; model?: string };
}

export interface TerminalLocation {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    province?: string;
}

export interface TerminalHealth {
    terminal_id: string;
    status: TerminalStatus;
    uptime_24h: number;
    transaction_count_24h: number;
    error_count_24h: number;
    last_transaction?: string;
    alerts: TerminalAlert[];
}

export interface TerminalAlert {
    id: string;
    terminal_id: string;
    type: TerminalAlertType;
    message: string;
    severity: AlertSeverity;
    created_at: string;
    resolved_at?: string;
}

export const TerminalAlertType = {
    LOW_PAPER: 'LOW_PAPER',
    LOW_CASH: 'LOW_CASH',
    OFFLINE: 'OFFLINE',
    HIGH_ERROR_RATE: 'HIGH_ERROR_RATE',
    HARDWARE_ERROR: 'HARDWARE_ERROR',
} as const;
export type TerminalAlertType = typeof TerminalAlertType[keyof typeof TerminalAlertType];

export const AlertSeverity = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    CRITICAL: 'CRITICAL',
} as const;
export type AlertSeverity = typeof AlertSeverity[keyof typeof AlertSeverity];

// Helpdesk types
export const TicketPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
} as const;
export type TicketPriority = typeof TicketPriority[keyof typeof TicketPriority];

export const TicketStatus = {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
    ESCALATED: 'ESCALATED',
} as const;
export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

export const TicketCategory = {
    TRANSACTION: 'TRANSACTION',
    TERMINAL: 'TERMINAL',
    ACCOUNT: 'ACCOUNT',
    TECHNICAL: 'TECHNICAL',
    OTHER: 'OTHER',
} as const;
export type TicketCategory = typeof TicketCategory[keyof typeof TicketCategory];

export interface Ticket {
    id: number;
    title: string;
    description: string;
    priority: TicketPriority;
    status: TicketStatus;
    category: TicketCategory;
    merchant_id?: string;
    terminal_id?: string;
    transaction_id?: number;
    created_by: string;
    assigned_to?: string;
    sla_deadline?: string;
    sla_breached: boolean;
    created_at: string;
    updated_at: string;
    resolved_at?: string;
    // Nested relations (populated when fetching single ticket)
    comments?: TicketComment[];
    activities?: TicketActivity[];
}

export interface TicketActivity {
    id: number;
    ticket_id: number;
    action: TicketAction;
    actor: string;
    actor_name?: string;
    details: string;
    old_value?: string;
    new_value?: string;
    created_at: string;
}

export const TicketAction = {
    CREATED: 'CREATED',
    UPDATED: 'UPDATED',
    COMMENTED: 'COMMENTED',
    STATUS_CHANGED: 'STATUS_CHANGED',
    ASSIGNED: 'ASSIGNED',
    ESCALATED: 'ESCALATED',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
} as const;
export type TicketAction = typeof TicketAction[keyof typeof TicketAction];

export interface TicketComment {
    id: number;
    ticket_id: number;
    author_id: string;
    author_name: string;
    content: string;
    is_internal: boolean;
    created_at: string;
    updated_at: string;
}

// Auth types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'operator' | 'viewer';
    avatar?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
    expires_at: string;
}
