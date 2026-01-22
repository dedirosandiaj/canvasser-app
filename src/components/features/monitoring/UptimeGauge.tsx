/**
 * Uptime Gauge Component
 * Berry Vue styled circular progress gauge
 */

import { cn } from '~/lib/utils/cn';

export interface UptimeGaugeProps {
    percentage: number;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
}

const sizeConfig = {
    sm: { size: 100, stroke: 8, fontSize: 'text-xl' },
    md: { size: 150, stroke: 10, fontSize: 'text-2xl' },
    lg: { size: 200, stroke: 12, fontSize: 'text-3xl' },
};

export function UptimeGauge(props: UptimeGaugeProps) {
    const size = () => props.size ?? 'md';
    const config = () => sizeConfig[size()];

    const radius = () => (config().size - config().stroke) / 2;
    const circumference = () => 2 * Math.PI * radius();
    const offset = () => circumference() - (props.percentage / 100) * circumference();

    // Color based on percentage
    const getColor = () => {
        if (props.percentage >= 99) return { stroke: 'text-success', bg: 'text-success-100' };
        if (props.percentage >= 95) return { stroke: 'text-primary', bg: 'text-primary-100' };
        if (props.percentage >= 90) return { stroke: 'text-warning', bg: 'text-warning-100' };
        return { stroke: 'text-error', bg: 'text-error-100' };
    };

    const colors = getColor();

    return (
        <div class={cn('relative inline-flex items-center justify-center', props.class)}>
            <svg
                width={config().size}
                height={config().size}
                class="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={config().size / 2}
                    cy={config().size / 2}
                    r={radius()}
                    fill="none"
                    stroke="currentColor"
                    stroke-width={config().stroke}
                    class={colors.bg}
                />

                {/* Progress circle */}
                <circle
                    cx={config().size / 2}
                    cy={config().size / 2}
                    r={radius()}
                    fill="none"
                    stroke="currentColor"
                    stroke-width={config().stroke}
                    stroke-linecap="round"
                    stroke-dasharray={String(circumference())}
                    stroke-dashoffset={String(offset())}
                    class={cn(colors.stroke, 'transition-all duration-500')}
                />
            </svg>

            {/* Center text */}
            <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class={cn(config().fontSize, 'font-bold text-darkText')}>
                    {props.percentage.toFixed(1)}
                </span>
                <span class="text-sm text-lightText">%</span>
            </div>
        </div>
    );
}

export default UptimeGauge;
