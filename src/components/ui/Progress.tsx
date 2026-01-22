/**
 * Progress Component
 * Linear and circular progress indicators
 */

import { Show } from 'solid-js';
import { cn } from '~/lib/utils/cn';

export type ProgressVariant = 'linear' | 'circular';
export type ProgressColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

export interface ProgressProps {
    value?: number; // 0-100, undefined for indeterminate
    variant?: ProgressVariant;
    color?: ProgressColor;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    class?: string;
}

const colorStyles: Record<ProgressColor, string> = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
};

const trackColors: Record<ProgressColor, string> = {
    primary: 'bg-primary-100',
    secondary: 'bg-secondary-100',
    success: 'bg-success-100',
    warning: 'bg-warning-100',
    error: 'bg-error-100',
};

const linearSizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
};

const circularSizes = {
    sm: { size: 32, stroke: 3 },
    md: { size: 48, stroke: 4 },
    lg: { size: 64, stroke: 5 },
};

export function Progress(props: ProgressProps) {
    const variant = () => props.variant ?? 'linear';
    const color = () => props.color ?? 'primary';
    const size = () => props.size ?? 'md';
    const value = () => props.value ?? 0;
    const isIndeterminate = () => props.value === undefined;

    if (variant() === 'circular') {
        const circSize = circularSizes[size()];
        const radius = (circSize.size - circSize.stroke) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (value() / 100) * circumference;

        return (
            <div class={cn('inline-flex items-center justify-center relative', props.class)}>
                <svg
                    width={circSize.size}
                    height={circSize.size}
                    class={cn(isIndeterminate() && 'animate-spin-slow')}
                >
                    {/* Track */}
                    <circle
                        cx={circSize.size / 2}
                        cy={circSize.size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        stroke-width={circSize.stroke}
                        class="text-gray-200"
                    />
                    {/* Progress */}
                    <circle
                        cx={circSize.size / 2}
                        cy={circSize.size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        stroke-width={circSize.stroke}
                        stroke-linecap="round"
                        stroke-dasharray={String(circumference)}
                        stroke-dashoffset={isIndeterminate() ? String(circumference * 0.75) : String(offset)}
                        class={cn(
                            'transition-all duration-300',
                            color() === 'primary' && 'text-primary',
                            color() === 'secondary' && 'text-secondary',
                            color() === 'success' && 'text-success',
                            color() === 'warning' && 'text-warning',
                            color() === 'error' && 'text-error'
                        )}
                        style={{ transform: 'rotate(-90deg)', 'transform-origin': '50% 50%' }}
                    />
                </svg>
                <Show when={props.showLabel && !isIndeterminate()}>
                    <span class="absolute text-xs font-medium text-darkText">
                        {Math.round(value())}%
                    </span>
                </Show>
            </div>
        );
    }

    // Linear progress
    return (
        <div class={cn('w-full', props.class)}>
            <div class={cn(
                'w-full rounded-sm overflow-hidden',
                trackColors[color()],
                linearSizes[size()]
            )}>
                <div
                    class={cn(
                        'h-full rounded-sm transition-all duration-300',
                        colorStyles[color()],
                        isIndeterminate() && 'animate-pulse w-1/2'
                    )}
                    style={!isIndeterminate() ? { width: `${value()}%` } : undefined}
                />
            </div>
            <Show when={props.showLabel && !isIndeterminate()}>
                <span class="text-xs text-lightText mt-1">{Math.round(value())}%</span>
            </Show>
        </div>
    );
}

export default Progress;
