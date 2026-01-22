/**
 * IconButton Component
 * Icon-only button with Berry Vue styling
 */

import { JSX } from 'solid-js';
import { cn } from '~/lib/utils/cn';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'flat' | 'outlined' | 'ghost' | 'text';
export type IconButtonColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';

export interface IconButtonProps {
    children: JSX.Element;
    size?: IconButtonSize;
    variant?: IconButtonVariant;
    color?: IconButtonColor;
    rounded?: 'sm' | 'md' | 'full';
    disabled?: boolean;
    class?: string;
    onClick?: (e: MouseEvent) => void;
    'aria-label'?: string;
}

const sizeStyles: Record<IconButtonSize, string> = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
};

const roundedStyles = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    full: 'rounded-full',
};

const colorConfig: Record<IconButtonColor, { flat: string; outlined: string; ghost: string; text: string }> = {
    primary: {
        flat: 'bg-primary-light text-primary hover:bg-primary-200',
        outlined: 'border border-primary text-primary hover:bg-primary-50',
        ghost: 'text-primary hover:bg-primary-50',
        text: 'text-primary hover:text-primary-dark',
    },
    secondary: {
        flat: 'bg-secondary-light text-secondary hover:bg-secondary-200',
        outlined: 'border border-secondary text-secondary hover:bg-secondary-50',
        ghost: 'text-secondary hover:bg-secondary-50',
        text: 'text-secondary hover:text-secondary-dark',
    },
    success: {
        flat: 'bg-success-light text-success hover:bg-success-200',
        outlined: 'border border-success text-success hover:bg-success-50',
        ghost: 'text-success hover:bg-success-50',
        text: 'text-success hover:text-success-700',
    },
    warning: {
        flat: 'bg-warning-light text-warning-700 hover:bg-warning-200',
        outlined: 'border border-warning text-warning-700 hover:bg-warning-50',
        ghost: 'text-warning-600 hover:bg-warning-50',
        text: 'text-warning-600 hover:text-warning-700',
    },
    error: {
        flat: 'bg-error-light text-error hover:bg-error-200',
        outlined: 'border border-error text-error hover:bg-error-50',
        ghost: 'text-error hover:bg-error-50',
        text: 'text-error hover:text-error-700',
    },
    gray: {
        flat: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        outlined: 'border border-gray-300 text-gray-600 hover:bg-gray-50',
        ghost: 'text-gray-600 hover:bg-gray-100',
        text: 'text-gray-600 hover:text-gray-800',
    },
};

export function IconButton(props: IconButtonProps) {
    const size = () => props.size ?? 'md';
    const variant = () => props.variant ?? 'flat';
    const color = () => props.color ?? 'primary';
    const rounded = () => props.rounded ?? 'sm';

    return (
        <button
            type="button"
            onClick={props.onClick}
            disabled={props.disabled}
            aria-label={props['aria-label']}
            class={cn(
                'inline-flex items-center justify-center',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                sizeStyles[size()],
                roundedStyles[rounded()],
                colorConfig[color()][variant()],
                props.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                props.class
            )}
        >
            {props.children}
        </button>
    );
}

export default IconButton;
