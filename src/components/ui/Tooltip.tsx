/**
 * Tooltip Component
 * Hover info tooltip with Berry Vue styling
 */

import { JSX, Show, createSignal, createEffect, onCleanup } from 'solid-js';
import { Portal, isServer } from 'solid-js/web';
import { cn } from '~/lib/utils/cn';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
    content: string | JSX.Element;
    children: JSX.Element;
    placement?: TooltipPlacement;
    delay?: number;
    class?: string;
}

export function Tooltip(props: TooltipProps) {
    if (isServer) return props.children;

    const [show, setShow] = createSignal(false);
    const [position, setPosition] = createSignal({ top: 0, left: 0 });
    let triggerRef: HTMLDivElement | undefined;
    let tooltipRef: HTMLDivElement | undefined;
    let timeout: ReturnType<typeof setTimeout>;

    const placement = () => props.placement ?? 'top';
    const delay = () => props.delay ?? 200;

    const updatePosition = () => {
        if (!triggerRef || !tooltipRef) return;

        const triggerRect = triggerRef.getBoundingClientRect();
        const tooltipRect = tooltipRef.getBoundingClientRect();
        const gap = 8;

        let top = 0;
        let left = 0;

        switch (placement()) {
            case 'top':
                top = triggerRect.top - tooltipRect.height - gap;
                left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = triggerRect.bottom + gap;
                left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                left = triggerRect.left - tooltipRect.width - gap;
                break;
            case 'right':
                top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                left = triggerRect.right + gap;
                break;
        }

        // Keep within viewport
        if (left < 8) left = 8;
        if (left + tooltipRect.width > window.innerWidth - 8) {
            left = window.innerWidth - tooltipRect.width - 8;
        }
        if (top < 8) top = triggerRect.bottom + gap;
        if (top + tooltipRect.height > window.innerHeight - 8) {
            top = triggerRect.top - tooltipRect.height - gap;
        }

        setPosition({ top, left });
    };

    const handleMouseEnter = () => {
        timeout = setTimeout(() => {
            setShow(true);
        }, delay());
    };

    const handleMouseLeave = () => {
        clearTimeout(timeout);
        setShow(false);
    };

    createEffect(() => {
        if (show()) {
            requestAnimationFrame(updatePosition);
        }
    });

    onCleanup(() => {
        clearTimeout(timeout);
    });

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
                class="inline-block"
            >
                {props.children}
            </div>

            <Show when={show()}>
                <Portal>
                    <div
                        ref={tooltipRef}
                        role="tooltip"
                        class={cn(
                            'fixed z-50 px-3 py-1.5 text-sm',
                            'bg-gray-800 text-white rounded-md shadow-berry',
                            'animate-fade-in pointer-events-none',
                            props.class
                        )}
                        style={{
                            top: `${position().top}px`,
                            left: `${position().left}px`,
                        }}
                    >
                        {props.content}
                    </div>
                </Portal>
            </Show>
        </>
    );
}

export default Tooltip;
