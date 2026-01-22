/**
 * Toast Context
 * Global toast state management for showing notifications anywhere in the app
 */

import { createContext, useContext, ParentComponent, createSignal, For } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Toast, ToastType } from './Toast';

interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>();

export const ToastProvider: ParentComponent = (props) => {
    const [toasts, setToasts] = createSignal<ToastItem[]>([]);

    const generateId = () => Math.random().toString(36).substring(7);

    const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
        const id = generateId();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const value: ToastContextValue = {
        showToast,
        success: (message, duration) => showToast(message, 'success', duration),
        error: (message, duration) => showToast(message, 'error', duration),
        warning: (message, duration) => showToast(message, 'warning', duration),
        info: (message, duration) => showToast(message, 'info', duration),
    };

    return (
        <ToastContext.Provider value={value}>
            {props.children}
            <Portal>
                <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
                    <For each={toasts()}>
                        {(toast) => (
                            <Toast
                                id={toast.id}
                                message={toast.message}
                                type={toast.type}
                                duration={toast.duration}
                                onClose={removeToast}
                            />
                        )}
                    </For>
                </div>
            </Portal>
        </ToastContext.Provider>
    );
};

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export default ToastContext;
