/**
 * Alert Component
 * Notification alerts with Berry Vue styling
 */

import { JSX, Show } from 'solid-js';
import { cn } from '~/lib/utils/cn';

export type AlertVariant = 'filled' | 'outlined' | 'standard';
export type AlertSeverity = 'success' | 'warning' | 'error' | 'info';

export interface AlertProps {
    severity: AlertSeverity;
    variant?: AlertVariant;
    title?: string;
    children: JSX.Element;
    icon?: JSX.Element;
    action?: JSX.Element;
    onClose?: () => void;
    class?: string;
}

const severityConfig: Record<AlertSeverity, { filled: string; outlined: string; standard: string; icon: string }> = {
    success: {
        filled: 'bg-success text-white',
        outlined: 'border border-success bg-success-light text-success-700',
        standard: 'bg-success-light text-success-700',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    warning: {
        filled: 'bg-warning text-gray-900',
        outlined: 'border border-warning bg-warning-light text-warning-700',
        standard: 'bg-warning-light text-warning-700',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    error: {
        filled: 'bg-error text-white',
        outlined: 'border border-error bg-error-light text-error-700',
        standard: 'bg-error-light text-error-700',
        icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    info: {
        filled: 'bg-info text-white',
        outlined: 'border border-info bg-info-light text-info-700',
        standard: 'bg-info-light text-info-700',
        icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
};

export function Alert(props: AlertProps) {
    const variant = () => props.variant ?? 'standard';
    const config = () => severityConfig[props.severity];

    return (
        <div
            role="alert"
            class={cn(
                'flex items-start gap-3 p-4 rounded-md',
                config()[variant()],
                props.class
            )}
        >
            {/* Icon */}
            <div class="flex-shrink-0 mt-0.5">
                <Show
                    when={props.icon}
                    fallback={
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d={config().icon} />
                        </svg>
                    }
                >
                    {props.icon}
                </Show>
            </div>

            {/* Content */}
            <div class="flex-1 min-w-0">
                <Show when={props.title}>
                    <h5 class="font-semibold mb-1">{props.title}</h5>
                </Show>
                <div class="text-sm">{props.children}</div>
            </div>

            {/* Action / Close */}
            <Show when={props.action || props.onClose}>
                <div class="flex-shrink-0 flex items-center gap-2">
                    {props.action}
                    <Show when={props.onClose}>
                        <button
                            type="button"
                            onClick={props.onClose}
                            class="p-1 rounded hover:bg-black/10 transition-colors"
                            aria-label="Close"
                        >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </Show>
                </div>
            </Show>
        </div>
    );
}

export default Alert;
