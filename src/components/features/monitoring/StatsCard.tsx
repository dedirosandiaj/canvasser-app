/**
 * StatsCard Component
 * Berry Vue styled stats card with colored backgrounds
 */

import { JSX, Show, For } from 'solid-js';
import { cn } from '~/lib/utils/cn';
import { Card, IconButton, Menu, type MenuItem } from '~/components/ui';

export type StatsCardVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    variant?: StatsCardVariant;
    icon?: JSX.Element;
    trend?: {
        value: number;
        label?: string;
    };
    chart?: number[]; // Mini sparkline data
    menuItems?: MenuItem[];
    class?: string;
}

const variantStyles: Record<StatsCardVariant, { bg: string; iconBg: string; menuBg: string }> = {
    primary: {
        bg: 'bg-primary',
        iconBg: 'bg-primary-dark',
        menuBg: 'bg-primary-600',
    },
    secondary: {
        bg: 'bg-secondary',
        iconBg: 'bg-secondary-dark',
        menuBg: 'bg-secondary-600',
    },
    success: {
        bg: 'bg-success',
        iconBg: 'bg-success-700',
        menuBg: 'bg-success-600',
    },
    warning: {
        bg: 'bg-warning',
        iconBg: 'bg-warning-600',
        menuBg: 'bg-warning-600',
    },
    error: {
        bg: 'bg-error',
        iconBg: 'bg-error-700',
        menuBg: 'bg-error-600',
    },
    info: {
        bg: 'bg-info',
        iconBg: 'bg-info-700',
        menuBg: 'bg-info-600',
    },
};

// Simple sparkline chart
function Sparkline(props: { data: number[]; class?: string }) {
    const max = () => Math.max(...props.data);
    const min = () => Math.min(...props.data);
    const range = () => max() - min() || 1;

    const points = () => {
        const height = 60;
        const width = 100;
        const step = width / (props.data.length - 1);

        return props.data
            .map((value, i) => {
                const y = height - ((value - min()) / range()) * height;
                return `${i * step},${y}`;
            })
            .join(' ');
    };

    return (
        <svg class={cn('w-24 h-16 opacity-80', props.class)} viewBox="0 0 100 60" preserveAspectRatio="none">
            <polyline
                points={points()}
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    );
}

export function StatsCard(props: StatsCardProps) {
    const variant = () => props.variant ?? 'primary';
    const styles = () => variantStyles[variant()];
    const isWarning = () => variant() === 'warning';

    return (
        <div
            class={cn(
                'relative rounded-md overflow-hidden',
                styles().bg,
                'bubble-shape',
                variant() === 'primary' && 'bubble-primary-shape',
                variant() === 'secondary' && 'bubble-secondary-shape',
                props.class
            )}
        >
            <div class="p-6 relative z-10">
                {/* Header */}
                <div class="flex items-start justify-between mb-6">
                    {/* Icon */}
                    <Show when={props.icon}>
                        <div class={cn(
                            'w-11 h-11 rounded-md flex items-center justify-center',
                            styles().iconBg,
                            isWarning() ? 'text-gray-900' : 'text-white'
                        )}>
                            {props.icon}
                        </div>
                    </Show>

                    {/* Menu */}
                    <Show when={props.menuItems}>
                        <Menu
                            trigger={
                                <IconButton
                                    variant="flat"
                                    color={isWarning() ? 'gray' : 'secondary'}
                                    size="sm"
                                    rounded="sm"
                                    class={cn(styles().menuBg, 'hover:opacity-80')}
                                    aria-label="Options"
                                >
                                    <DotsIcon color={isWarning() ? 'text-gray-900' : 'text-white'} />
                                </IconButton>
                            }
                            items={props.menuItems!}
                            placement="bottom-end"
                        />
                    </Show>
                </div>

                {/* Content */}
                <div>
                    {/* Value */}
                    <h2 class={cn(
                        'text-h1 font-bold flex items-center gap-2',
                        isWarning() ? 'text-gray-900' : 'text-white'
                    )}>
                        {props.value}
                        <Show when={props.trend}>
                            <TrendIcon up={props.trend!.value >= 0} warning={isWarning()} />
                        </Show>
                    </h2>

                    {/* Title */}
                    <p class={cn(
                        'text-subtitle1 mt-1',
                        isWarning() ? 'text-gray-700' : 'text-white/70'
                    )}>
                        {props.title}
                    </p>

                    {/* Subtitle/Trend */}
                    <Show when={props.subtitle || props.trend?.label}>
                        <p class={cn(
                            'text-caption mt-2',
                            isWarning() ? 'text-gray-600' : 'text-white/60'
                        )}>
                            {props.subtitle || props.trend?.label}
                        </p>
                    </Show>
                </div>
            </div>

            {/* Sparkline Chart - positioned behind content */}
            <Show when={props.chart && props.chart.length > 1}>
                <div class="absolute bottom-0 right-0 z-0 opacity-30">
                    <Sparkline
                        data={props.chart!}
                        class={cn(
                            'w-32 h-20',
                            isWarning() ? 'text-gray-700' : 'text-white'
                        )}
                    />
                </div>
            </Show>
        </div>
    );
}

// Icons
function DotsIcon(props: { color?: string }) {
    return (
        <svg class={cn('w-5 h-5', props.color || 'text-current')} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
    );
}

function TrendIcon(props: { up: boolean; warning?: boolean }) {
    return (
        <svg
            class={cn(
                'w-6 h-6',
                props.warning ? 'text-gray-700' : 'text-white'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d={props.up
                    ? 'M7 17l9.2-9.2M17 17V7H7'
                    : 'M17 7l-9.2 9.2M7 7v10h10'
                }
            />
        </svg>
    );
}

export default StatsCard;
