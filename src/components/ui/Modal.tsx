/**
 * Modal Component
 * Berry Vue styled modal dialog
 */

import { JSX, Show, createEffect, onCleanup } from 'solid-js';
import { Portal, isServer } from 'solid-js/web';
import { cn } from '~/lib/utils/cn';
import Button from './Button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    size?: ModalSize;
    closeOnBackdrop?: boolean;
    closeOnEsc?: boolean;
    showCloseButton?: boolean;
    children: JSX.Element;
    footer?: JSX.Element;
    class?: string;
}

const sizeStyles: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
};

export function Modal(props: ModalProps) {
    if (isServer) return null;

    let dialogRef: HTMLDivElement | undefined;
    let previousActiveElement: HTMLElement | null = null;

    const size = () => props.size ?? 'md';
    const closeOnBackdrop = () => props.closeOnBackdrop ?? true;
    const closeOnEsc = () => props.closeOnEsc ?? true;
    const showCloseButton = () => props.showCloseButton ?? true;

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEsc()) {
            props.onClose();
        }
    };

    const trapFocus = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !dialogRef) return;

        const focusableElements = dialogRef.querySelectorAll(
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
            setTimeout(() => dialogRef?.focus(), 0);
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
                    class="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={handleBackdropClick}
                    role="presentation"
                >
                    {/* Backdrop */}
                    <div
                        class="absolute inset-0 bg-black/40 animate-fade-in"
                        aria-hidden="true"
                    />

                    {/* Dialog */}
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={props.title ? 'modal-title' : undefined}
                        aria-describedby={props.description ? 'modal-description' : undefined}
                        tabIndex={-1}
                        class={cn(
                            'relative w-full bg-surface rounded-md shadow-berry-xl',
                            'animate-scale-in',
                            'focus:outline-none',
                            sizeStyles[size()],
                            props.class
                        )}
                    >
                        {/* Header */}
                        <Show when={props.title || showCloseButton()}>
                            <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <div>
                                    <Show when={props.title}>
                                        <h2 id="modal-title" class="text-lg font-semibold text-darkText">
                                            {props.title}
                                        </h2>
                                    </Show>
                                    <Show when={props.description}>
                                        <p id="modal-description" class="text-sm text-lightText mt-1">
                                            {props.description}
                                        </p>
                                    </Show>
                                </div>
                                <Show when={showCloseButton()}>
                                    <button
                                        onClick={props.onClose}
                                        class={cn(
                                            'p-2 rounded-md text-lightText',
                                            'hover:bg-gray-100 hover:text-darkText',
                                            'transition-colors',
                                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                                        )}
                                        aria-label="Close modal"
                                    >
                                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </Show>
                            </div>
                        </Show>

                        {/* Body */}
                        <div class="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {props.children}
                        </div>

                        {/* Footer */}
                        <Show when={props.footer}>
                            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                                {props.footer}
                            </div>
                        </Show>
                    </div>
                </div>
            </Portal>
        </Show>
    );
}

export default Modal;
