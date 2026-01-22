/**
 * Chip Component
 * Small status/tag labels with Berry Vue styling
 */

import { JSX, Show } from 'solid-js';
import { cn } from '~/lib/utils/cn';

export type ChipSize = 'sm' | 'md' | 'lg';
export type ChipVariant = 'filled' | 'outlined' | 'soft';
export type ChipColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray';

export interface ChipProps {
    label: string;
    size?: ChipSize;
    variant?: ChipVariant;
    color?: ChipColor;
    icon?: JSX.Element;
    onClose?: () => void;
    clickable?: boolean;
    class?: string;
    onClick?: () => void;
}

const sizeStyles: Record<ChipSize, string> = {
    sm: 'h-6 px-2 text-xs gap-1',
    md: 'h-8 px-3 text-sm gap-1.5',
    lg: 'h-10 px-4 text-base gap-2',
};

const colorConfig: Record<ChipColor, { filled: string; outlined: string; soft: string }> = {
    primary: {
        filled: 'bg-primary text-white',
        outlined: 'border border-primary text-primary',
        soft: 'bg-primary-light text-primary',
    },
    secondary: {
        filled: 'bg-secondary text-white',
        outlined: 'border border-secondary text-secondary',
        soft: 'bg-secondary-light text-secondary',
    },
    success: {
        filled: 'bg-success text-white',
        outlined: 'border border-success text-success',
        soft: 'bg-success-light text-success',
    },
    warning: {
        filled: 'bg-warning text-gray-900',
        outlined: 'border border-warning text-warning-700',
        soft: 'bg-warning-light text-warning-700',
    },
    error: {
        filled: 'bg-error text-white',
        outlined: 'border border-error text-error',
        soft: 'bg-error-light text-error',
    },
    info: {
        filled: 'bg-info text-white',
        outlined: 'border border-info text-info',
        soft: 'bg-info-light text-info-700',
    },
    gray: {
        filled: 'bg-gray-500 text-white',
        outlined: 'border border-gray-400 text-gray-600',
        soft: 'bg-gray-100 text-gray-600',
    },
};

export function Chip(props: ChipProps) {
    const size = () => props.size ?? 'md';
    const variant = () => props.variant ?? 'soft';
    const color = () => props.color ?? 'primary';

    return (
        <span
            onClick={props.clickable || props.onClick ? props.onClick : undefined}
            class={cn(
                'inline-flex items-center justify-center rounded-pill font-medium',
                sizeStyles[size()],
                colorConfig[color()][variant()],
                (props.clickable || props.onClick) && 'cursor-pointer hover:opacity-80 transition-opacity',
                props.class
            )}
        >
            <Show when={props.icon}>
                <span class="flex-shrink-0">{props.icon}</span>
            </Show>
            <span>{props.label}</span>
            <Show when={props.onClose}>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        props.onClose?.();
                    }}
                    class="ml-1 flex-shrink-0 hover:opacity-70 transition-opacity"
                    aria-label="Remove"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </Show>
        </span>
    );
}

export default Chip;
