/**
 * Button Component
 * Berry Vue styled button with variants, sizes, and states
 */

import { JSX, Show, splitProps } from 'solid-js';
import { cn } from '~/lib/utils/cn';

export type ButtonVariant = 'contained' | 'outlined' | 'text';
export type ButtonColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: ButtonSize;
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    leftIcon?: JSX.Element;
    rightIcon?: JSX.Element;
    children: JSX.Element;
    class?: string;
    type?: 'button' | 'submit' | 'reset';
    onClick?: (e: MouseEvent) => void;
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
};

const colorConfig: Record<ButtonColor, { contained: string; outlined: string; text: string }> = {
    primary: {
        contained: 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md',
        outlined: 'border-2 border-primary text-primary hover:bg-primary-50',
        text: 'text-primary hover:bg-primary-50',
    },
    secondary: {
        contained: 'bg-secondary text-white hover:bg-secondary-dark shadow-sm hover:shadow-md',
        outlined: 'border-2 border-secondary text-secondary hover:bg-secondary-50',
        text: 'text-secondary hover:bg-secondary-50',
    },
    success: {
        contained: 'bg-success text-white hover:bg-success-700 shadow-sm hover:shadow-md',
        outlined: 'border-2 border-success text-success hover:bg-success-50',
        text: 'text-success hover:bg-success-50',
    },
    warning: {
        contained: 'bg-warning text-gray-900 hover:bg-warning-600 shadow-sm hover:shadow-md',
        outlined: 'border-2 border-warning text-warning-700 hover:bg-warning-50',
        text: 'text-warning-700 hover:bg-warning-50',
    },
    error: {
        contained: 'bg-error text-white hover:bg-error-700 shadow-sm hover:shadow-md',
        outlined: 'border-2 border-error text-error hover:bg-error-50',
        text: 'text-error hover:bg-error-50',
    },
    gray: {
        contained: 'bg-gray-500 text-white hover:bg-gray-600 shadow-sm hover:shadow-md',
        outlined: 'border-2 border-gray-300 text-gray-600 hover:bg-gray-50',
        text: 'text-gray-600 hover:bg-gray-100',
    },
};

// Loading spinner
function LoadingSpinner() {
    return (
        <svg
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
            />
            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}

export function Button(props: ButtonProps) {
    const variant = () => props.variant ?? 'contained';
    const color = () => props.color ?? 'primary';
    const size = () => props.size ?? 'md';

    return (
        <button
            type={props.type ?? 'button'}
            onClick={props.onClick}
            disabled={props.disabled || props.loading}
            class={cn(
                // Base styles
                'inline-flex items-center justify-center font-medium rounded-md',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
                // Size
                sizeStyles[size()],
                // Variant + Color
                colorConfig[color()][variant()],
                // Full width
                props.fullWidth && 'w-full',
                // Disabled
                (props.disabled || props.loading) && 'opacity-60 cursor-not-allowed pointer-events-none',
                props.class
            )}
        >
            <Show when={props.loading} fallback={props.leftIcon}>
                <LoadingSpinner />
            </Show>
            <span>{props.children}</span>
            <Show when={props.rightIcon && !props.loading}>
                {props.rightIcon}
            </Show>
        </button>
    );
}

export default Button;
