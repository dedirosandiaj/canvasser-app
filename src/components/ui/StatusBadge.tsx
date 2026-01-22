/**
 * StatusBadge Component
 * Berry Vue styled status indicators
 */

import { Show } from 'solid-js';
import { cn } from '~/lib/utils/cn';

export type StatusType =
    // Transaction status
    | 'SUCCESS' | 'PENDING' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
    // Terminal status
    | 'ONLINE' | 'OFFLINE' | 'LOW_PAPER' | 'ERROR' | 'MAINTENANCE'
    // Ticket status
    | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED'
    // Priority
    | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    // System
    | 'HEALTHY' | 'DEGRADED' | 'DOWN'
    // Generic
    | 'ACTIVE' | 'INACTIVE' | 'WARNING' | 'INFO';

export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'filled' | 'soft' | 'outlined';

export interface StatusBadgeProps {
    status: StatusType | string;
    size?: BadgeSize;
    variant?: BadgeVariant;
    pulse?: boolean;
    class?: string;
    label?: string; // Custom label override
}

// Status to color mapping
const statusColors: Record<string, { bg: string; text: string; soft: string; border: string }> = {
    // Success states
    SUCCESS: { bg: 'bg-success', text: 'text-white', soft: 'bg-success-light text-success-700', border: 'border-success text-success' },
    ONLINE: { bg: 'bg-success', text: 'text-white', soft: 'bg-success-light text-success-700', border: 'border-success text-success' },
    RESOLVED: { bg: 'bg-success', text: 'text-white', soft: 'bg-success-light text-success-700', border: 'border-success text-success' },
    HEALTHY: { bg: 'bg-success', text: 'text-white', soft: 'bg-success-light text-success-700', border: 'border-success text-success' },
    ACTIVE: { bg: 'bg-success', text: 'text-white', soft: 'bg-success-light text-success-700', border: 'border-success text-success' },

    // Warning states
    PENDING: { bg: 'bg-warning', text: 'text-gray-900', soft: 'bg-warning-light text-warning-700', border: 'border-warning text-warning-700' },
    LOW_PAPER: { bg: 'bg-warning', text: 'text-gray-900', soft: 'bg-warning-light text-warning-700', border: 'border-warning text-warning-700' },
    IN_PROGRESS: { bg: 'bg-warning', text: 'text-gray-900', soft: 'bg-warning-light text-warning-700', border: 'border-warning text-warning-700' },
    MEDIUM: { bg: 'bg-warning', text: 'text-gray-900', soft: 'bg-warning-light text-warning-700', border: 'border-warning text-warning-700' },
    DEGRADED: { bg: 'bg-warning', text: 'text-gray-900', soft: 'bg-warning-light text-warning-700', border: 'border-warning text-warning-700' },
    WARNING: { bg: 'bg-warning', text: 'text-gray-900', soft: 'bg-warning-light text-warning-700', border: 'border-warning text-warning-700' },

    // Error states
    FAILED: { bg: 'bg-error', text: 'text-white', soft: 'bg-error-light text-error-700', border: 'border-error text-error' },
    OFFLINE: { bg: 'bg-error', text: 'text-white', soft: 'bg-error-light text-error-700', border: 'border-error text-error' },
    ERROR: { bg: 'bg-error', text: 'text-white', soft: 'bg-error-light text-error-700', border: 'border-error text-error' },
    CRITICAL: { bg: 'bg-error', text: 'text-white', soft: 'bg-error-light text-error-700', border: 'border-error text-error' },
    DOWN: { bg: 'bg-error', text: 'text-white', soft: 'bg-error-light text-error-700', border: 'border-error text-error' },
    CANCELLED: { bg: 'bg-error', text: 'text-white', soft: 'bg-error-light text-error-700', border: 'border-error text-error' },

    // Info / Primary states
    OPEN: { bg: 'bg-primary', text: 'text-white', soft: 'bg-primary-light text-primary', border: 'border-primary text-primary' },
    INFO: { bg: 'bg-info', text: 'text-white', soft: 'bg-info-light text-info-700', border: 'border-info text-info-700' },

    // Secondary states
    ESCALATED: { bg: 'bg-secondary', text: 'text-white', soft: 'bg-secondary-light text-secondary', border: 'border-secondary text-secondary' },
    HIGH: { bg: 'bg-secondary', text: 'text-white', soft: 'bg-secondary-light text-secondary', border: 'border-secondary text-secondary' },

    // Neutral states
    CLOSED: { bg: 'bg-gray-500', text: 'text-white', soft: 'bg-gray-100 text-gray-600', border: 'border-gray-400 text-gray-600' },
    MAINTENANCE: { bg: 'bg-gray-500', text: 'text-white', soft: 'bg-gray-100 text-gray-600', border: 'border-gray-400 text-gray-600' },
    INACTIVE: { bg: 'bg-gray-500', text: 'text-white', soft: 'bg-gray-100 text-gray-600', border: 'border-gray-400 text-gray-600' },
    LOW: { bg: 'bg-gray-500', text: 'text-white', soft: 'bg-gray-100 text-gray-600', border: 'border-gray-400 text-gray-600' },
    REFUNDED: { bg: 'bg-gray-500', text: 'text-white', soft: 'bg-gray-100 text-gray-600', border: 'border-gray-400 text-gray-600' },
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
};

// Format status text for display
function formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusBadge(props: StatusBadgeProps) {
    const size = () => props.size ?? 'md';
    const variant = () => props.variant ?? 'soft';
    const statusUpper = props.status.toUpperCase();

    const colors = () => statusColors[statusUpper] || {
        bg: 'bg-gray-500',
        text: 'text-white',
        soft: 'bg-gray-100 text-gray-600',
        border: 'border-gray-400 text-gray-600',
    };

    const getVariantStyles = () => {
        const c = colors();
        switch (variant()) {
            case 'filled':
                return `${c.bg} ${c.text}`;
            case 'outlined':
                return `border ${c.border} bg-transparent`;
            default:
                return c.soft;
        }
    };

    return (
        <span
            class={cn(
                'inline-flex items-center gap-1.5 font-medium rounded-pill',
                sizeStyles[size()],
                getVariantStyles(),
                props.class
            )}
        >
            <Show when={props.pulse}>
                <span class={cn(
                    'w-2 h-2 rounded-full animate-pulse',
                    statusColors[statusUpper]?.bg || 'bg-gray-500'
                )} />
            </Show>
            {props.label || formatStatus(props.status)}
        </span>
    );
}

export default StatusBadge;
