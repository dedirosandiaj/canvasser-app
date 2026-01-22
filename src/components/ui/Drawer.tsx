/**
 * Drawer Component
 * Berry Vue styled slide-in panel
 */

import { JSX, Show, createEffect, onCleanup } from 'solid-js';
import { Portal, isServer } from 'solid-js/web';
import { cn } from '~/lib/utils/cn';

export type DrawerPosition = 'left' | 'right';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DrawerProps {
    open: boolean;
    onClose: () => void;
    position?: DrawerPosition;
    size?: DrawerSize;
    title?: string;
    closeOnBackdrop?: boolean;
    closeOnEsc?: boolean;
    showCloseButton?: boolean;
    children: JSX.Element;
    footer?: JSX.Element;
    class?: string;
}

const sizeStyles: Record<DrawerSize, string> = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[28rem]',
    xl: 'w-[32rem]',
};

const positionStyles: Record<DrawerPosition, { container: string; panel: string; animation: string }> = {
    left: {
        container: 'justify-start',
        panel: 'left-0',
        animation: 'animate-slide-in-left',
    },
    right: {
        container: 'justify-end',
        panel: 'right-0',
        animation: 'animate-slide-in-right',
    },
};

export function Drawer(props: DrawerProps) {
    if (isServer) return null;

    let drawerRef: HTMLDivElement | undefined;
    let previousActiveElement: HTMLElement | null = null;

    const position = () => props.position ?? 'right';
    const size = () => props.size ?? 'md';
    const closeOnBackdrop = () => props.closeOnBackdrop ?? true;
    const closeOnEsc = () => props.closeOnEsc ?? true;
    const showCloseButton = () => props.showCloseButton ?? true;

    const posStyles = () => positionStyles[position()];

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEsc()) {
            props.onClose();
        }
    };

    const trapFocus = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !drawerRef) return;

        const focusableElements = drawerRef.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
        }
    };

    createEffect(() => {
        if (props.open) {
            previousActiveElement = document.activeElement as HTMLElement;
            setTimeout(() => drawerRef?.focus(), 0);
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keydown', trapFocus);
        } else {
            document.body.style.overflow = '';
            previousActiveElement?.focus();
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keydown', trapFocus);
        }
    });

    onCleanup(() => {
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keydown', trapFocus);
        }
    });

    const handleBackdropClick = (e: MouseEvent) => {
        if (e.target === e.currentTarget && closeOnBackdrop()) {
            props.onClose();
        }
    };

    return (
        <Show when={props.open}>
            <Portal>
                <div
                    class={cn('fixed inset-0 z-50 flex', posStyles().container)}
                    onClick={handleBackdropClick}
                    role="presentation"
                >
                    {/* Backdrop */}
                    <div
                        class="absolute inset-0 bg-black/40 animate-fade-in"
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <div
                        ref={drawerRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={props.title ? 'drawer-title' : undefined}
                        tabIndex={-1}
                        class={cn(
                            'relative h-full bg-surface shadow-berry-xl',
                            'flex flex-col',
                            'focus:outline-none',
                            sizeStyles[size()],
                            posStyles().animation,
                            props.class
                        )}
                    >
                        {/* Header */}
                        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
                            <Show when={props.title}>
                                <h2 id="drawer-title" class="text-lg font-semibold text-darkText">
                                    {props.title}
                                </h2>
                            </Show>
                            <Show when={showCloseButton()}>
                                <button
                                    onClick={props.onClose}
                                    class={cn(
                                        'p-2 rounded-md text-lightText',
                                        'hover:bg-gray-100 hover:text-darkText',
                                        'transition-colors ml-auto',
                                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                                    )}
                                    aria-label="Close drawer"
                                >
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </Show>
                        </div>

                        {/* Body */}
                        <div class="flex-1 p-6 overflow-y-auto">
                            {props.children}
                        </div>

                        {/* Footer */}
                        <Show when={props.footer}>
                            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
                                {props.footer}
                            </div>
                        </Show>
                    </div>
                </div>
            </Portal>
        </Show>
    );
}

export default Drawer;
