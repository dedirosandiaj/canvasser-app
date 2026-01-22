/**
 * Toast Component
 * A reusable toast notification component with different variants
 */

import { Show, createSignal, onCleanup, onMount } from 'solid-js';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    id: string;
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

const iconMap: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
};

const colorMap: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
    success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'text-green-500 bg-green-100',
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-500 bg-red-100',
    },
    warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: 'text-yellow-500 bg-yellow-100',
    },
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-500 bg-blue-100',
    },
};

export function Toast(props: ToastProps) {
    const [isVisible, setIsVisible] = createSignal(true);
    const [isLeaving, setIsLeaving] = createSignal(false);
    const type = () => props.type || 'info';
    const colors = () => colorMap[type()];

    let timer: ReturnType<typeof setTimeout>;

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsVisible(false);
            props.onClose(props.id);
        }, 200);
    };

    onMount(() => {
        if (props.duration !== 0) {
            timer = setTimeout(handleClose, props.duration || 4000);
        }
    });

    onCleanup(() => {
        if (timer) clearTimeout(timer);
    });

    return (
        <Show when={isVisible()}>
            <div
                class={`
                    flex items-center gap-3 p-4 rounded-lg border shadow-lg
                    transition-all duration-200 max-w-md
                    ${colors().bg} ${colors().border} ${colors().text}
                    ${isLeaving() ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
                `}
                role="alert"
            >
                <span
                    class={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${colors().icon}`}
                >
                    {iconMap[type()]}
                </span>
                <p class="flex-1 text-sm font-medium">{props.message}</p>
                <button
                    onClick={handleClose}
                    class="p-1 rounded hover:bg-black/5 transition-colors"
                    aria-label="Close"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </Show>
    );
}

export default Toast;
