/**
 * Confirm Modal Component
 * A reusable confirmation modal to replace browser's confirm() dialog
 */

import { Show, createSignal } from 'solid-js';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmModal(props: ConfirmModalProps) {
    const [isSubmitting, setIsSubmitting] = createSignal(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await props.onConfirm();
        } finally {
            setIsSubmitting(false);
        }
    };

    const variantColors = () => {
        switch (props.variant) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700';
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700';
            default:
                return 'bg-primary hover:bg-primary/90';
        }
    };

    const variantIcon = () => {
        switch (props.variant) {
            case 'danger':
                return (
                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                        <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            title=""
            size="sm"
        >
            <div class="text-center py-4">
                {variantIcon()}
                <h3 class="mt-4 text-lg font-semibold text-gray-900">
                    {props.title || 'Confirm Action'}
                </h3>
                <p class="mt-2 text-sm text-gray-500">
                    {props.message}
                </p>
            </div>
            <div class="flex gap-3 mt-6 justify-center">
                <Button
                    variant="outlined"
                    color="gray"
                    onClick={props.onClose}
                    disabled={isSubmitting() || props.isLoading}
                >
                    {props.cancelText || 'Cancel'}
                </Button>
                <Button
                    variant="contained"
                    class={`${variantColors()} text-white`}
                    onClick={handleConfirm}
                    disabled={isSubmitting() || props.isLoading}
                >
                    {isSubmitting() || props.isLoading
                        ? 'Processing...'
                        : (props.confirmText || 'Confirm')
                    }
                </Button>
            </div>
        </Modal>
    );
}

export default ConfirmModal;
