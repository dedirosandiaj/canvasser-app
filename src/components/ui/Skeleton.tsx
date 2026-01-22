/**
 * Skeleton Component
 * Loading placeholder with animation
 */

import { cn } from '~/lib/utils/cn';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

export interface SkeletonProps {
    variant?: SkeletonVariant;
    width?: string | number;
    height?: string | number;
    class?: string;
    animation?: 'pulse' | 'wave' | 'none';
}

const variantStyles: Record<SkeletonVariant, string> = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-md',
};

const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent',
    none: '',
};

export function Skeleton(props: SkeletonProps) {
    const variant = () => props.variant ?? 'text';
    const animation = () => props.animation ?? 'pulse';

    const getSize = () => {
        const styles: Record<string, string> = {};

        if (props.width) {
            styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
        } else if (variant() === 'text') {
            styles.width = '100%';
        } else if (variant() === 'circular') {
            styles.width = '40px';
        }

        if (props.height) {
            styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
        } else if (variant() === 'circular') {
            styles.height = styles.width || '40px';
        } else if (variant() === 'text') {
            styles.height = '1em';
        }

        return styles;
    };

    return (
        <span
            class={cn(
                'inline-block bg-gray-200',
                variantStyles[variant()],
                animationStyles[animation()],
                props.class
            )}
            style={getSize()}
        />
    );
}

// Preset skeleton components
export function SkeletonText(props: { lines?: number; class?: string }) {
    const lines = () => props.lines ?? 3;

    return (
        <div class={cn('space-y-2', props.class)}>
            {Array.from({ length: lines() }).map((_, i) => (
                <Skeleton
                    variant="text"
                    width={i === lines() - 1 ? '80%' : '100%'}
                />
            ))}
        </div>
    );
}

export function SkeletonAvatar(props: { size?: 'sm' | 'md' | 'lg'; class?: string }) {
    const sizes = { sm: 32, md: 40, lg: 56 };
    const size = sizes[props.size ?? 'md'];

    return <Skeleton variant="circular" width={size} height={size} class={props.class} />;
}

export function SkeletonCard(props: { class?: string }) {
    return (
        <div class={cn('bg-surface rounded-md p-4 space-y-4 shadow-card', props.class)}>
            <div class="flex items-center gap-3">
                <SkeletonAvatar />
                <div class="flex-1 space-y-2">
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={12} />
                </div>
            </div>
            <SkeletonText lines={3} />
        </div>
    );
}

export default Skeleton;
