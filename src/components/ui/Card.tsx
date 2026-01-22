/**
 * Card Component
 * Base card with Berry Vue styling - flat design with title, divider, and content
 */

import { JSX, Show, splitProps } from 'solid-js';
import { cn } from '~/lib/utils/cn';

export type CardVariant = 'flat' | 'outlined' | 'elevated' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

export interface CardProps {
    variant?: CardVariant;
    title?: string;
    subtitle?: string;
    children: JSX.Element;
    action?: JSX.Element;
    footer?: JSX.Element;
    class?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    bubble?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
    flat: 'bg-surface border-0 shadow-card',
    outlined: 'bg-surface border border-borderLight',
    elevated: 'bg-surface shadow-berry-md',
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-gray-900',
    error: 'bg-error text-white',
};

const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export function Card(props: CardProps) {
    const variant = () => props.variant ?? 'flat';
    const padding = () => props.padding ?? 'md';
    const isColored = () => ['primary', 'secondary', 'success', 'warning', 'error'].includes(variant());

    return (
        <div
            class={cn(
                'rounded-md w-full overflow-visible',
                variantStyles[variant()],
                props.bubble && isColored() && 'bubble-shape',
                props.bubble && variant() === 'primary' && 'bubble-primary-shape',
                props.bubble && variant() === 'secondary' && 'bubble-secondary-shape',
                props.class
            )}
        >
            {/* Header */}
            <Show when={props.title || props.action}>
                <div class={cn(
                    'flex items-center justify-between',
                    padding() !== 'none' && 'px-6 py-5',
                    isColored() && 'border-b border-white/10',
                    !isColored() && 'border-b border-borderLight'
                )}>
                    <div>
                        <Show when={props.title}>
                            <h3 class={cn(
                                'text-lg font-semibold',
                                isColored() ? 'text-white' : 'text-darkText'
                            )}>
                                {props.title}
                            </h3>
                        </Show>
                        <Show when={props.subtitle}>
                            <p class={cn(
                                'text-sm mt-0.5',
                                isColored() ? 'text-white/70' : 'text-lightText'
                            )}>
                                {props.subtitle}
                            </p>
                        </Show>
                    </div>
                    <Show when={props.action}>
                        <div class="ml-auto z-10">{props.action}</div>
                    </Show>
                </div>
            </Show>

            {/* Content */}
            <div class={cn(paddingStyles[padding()])}>
                {props.children}
            </div>

            {/* Footer */}
            <Show when={props.footer}>
                <div class={cn(
                    'flex items-center justify-end gap-3',
                    padding() !== 'none' && 'px-6 py-4',
                    isColored() && 'border-t border-white/10',
                    !isColored() && 'border-t border-borderLight'
                )}>
                    {props.footer}
                </div>
            </Show>
        </div>
    );
}

export default Card;
