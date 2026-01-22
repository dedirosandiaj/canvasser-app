/**
 * Notifications Store
 * In-app notifications and toast messages
 */

import { createSignal, createRoot } from 'solid-js';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number; // ms, 0 = persistent
    timestamp: Date;
}

// Toast configuration
const DEFAULT_DURATION = 5000; // 5 seconds
const MAX_NOTIFICATIONS = 5;

function createNotificationsStore() {
    const [notifications, setNotifications] = createSignal<Notification[]>([]);
    const [unreadCount, setUnreadCount] = createSignal(0);

    // Generate unique ID
    const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add notification
    const notify = (
        type: NotificationType,
        title: string,
        message?: string,
        duration = DEFAULT_DURATION
    ): string => {
        const id = generateId();
        const notification: Notification = {
            id,
            type,
            title,
            message,
            duration,
            timestamp: new Date(),
        };

        setNotifications((prev) => {
            const updated = [notification, ...prev];
            // Limit max notifications
            return updated.slice(0, MAX_NOTIFICATIONS);
        });

        setUnreadCount((c) => c + 1);

        // Auto-dismiss if duration > 0
        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }

        return id;
    };

    // Convenience methods
    const info = (title: string, message?: string) => notify('info', title, message);
    const success = (title: string, message?: string) => notify('success', title, message);
    const warning = (title: string, message?: string) => notify('warning', title, message);
    const error = (title: string, message?: string) => notify('error', title, message, 0); // Errors persist

    // Dismiss notification
    const dismiss = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    // Clear all
    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    // Mark all as read
    const markAllRead = () => {
        setUnreadCount(0);
    };

    return {
        // State
        notifications,
        unreadCount,

        // Actions
        notify,
        info,
        success,
        warning,
        error,
        dismiss,
        clearAll,
        markAllRead,
    };
}

// Export singleton store
export const notificationsStore = createRoot(createNotificationsStore);

export default notificationsStore;
