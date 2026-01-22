/**
 * Avatar Component
 * Profile image display with size variants and fallback
 */

import { Show } from 'solid-js';
import { cn } from '~/lib/utils/cn';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circular' | 'rounded' | 'square';

export interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: AvatarSize;
    variant?: AvatarVariant;
    class?: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
}

const sizeStyles: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
};

const variantStyles: Record<AvatarVariant, string> = {
    circular: 'rounded-full',
    rounded: 'rounded-md',
    square: 'rounded-none',
};

const colorStyles: Record<string, string> = {
    primary: 'bg-primary-light text-primary',
    secondary: 'bg-secondary-light text-secondary',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning-700',
    error: 'bg-error-light text-error',
    gray: 'bg-gray-200 text-gray-600',
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function Avatar(props: AvatarProps) {
    const size = () => props.size ?? 'md';
    const variant = () => props.variant ?? 'circular';
    const color = () => props.color ?? 'primary';

    return (
        <div
            class={cn(
                'flex items-center justify-center font-medium flex-shrink-0 overflow-hidden',
                sizeStyles[size()],
                variantStyles[variant()],
                !props.src && colorStyles[color()],
                props.class
            )}
        >
            <Show
                when={props.src}
                fallback={
                    <span>{props.name ? getInitials(props.name) : '?'}</span>
                }
            >
                <img
                    src={props.src}
                    alt={props.alt || props.name || 'Avatar'}
                    class={cn('w-full h-full object-cover', variantStyles[variant()])}
                />
            </Show>
        </div>
    );
}

export default Avatar;
