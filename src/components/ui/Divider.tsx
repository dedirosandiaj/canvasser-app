/**
 * Divider Component
 * Horizontal or vertical separator line
 */

import { cn } from '~/lib/utils/cn';

export interface DividerProps {
    orientation?: 'horizontal' | 'vertical';
    variant?: 'full' | 'inset' | 'middle';
    class?: string;
}

export function Divider(props: DividerProps) {
    const orientation = () => props.orientation ?? 'horizontal';
    const variant = () => props.variant ?? 'full';

    const marginStyles = {
        full: '',
        inset: orientation() === 'horizontal' ? 'mx-4' : 'my-4',
        middle: orientation() === 'horizontal' ? 'mx-8' : 'my-8',
    };

    return (
        <div
            role="separator"
            aria-orientation={orientation()}
            class={cn(
                'bg-borderLight',
                orientation() === 'horizontal'
                    ? 'h-px w-full'
                    : 'w-px h-full min-h-[20px]',
                marginStyles[variant()],
                props.class
            )}
        />
    );
}

export default Divider;
