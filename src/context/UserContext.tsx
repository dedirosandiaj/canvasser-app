/**
 * User Context
 * Provides user information and permissions throughout the application
 */

import { createContext, createSignal, useContext, ParentComponent, createEffect, onMount } from 'solid-js';

// Types
export interface UserPermission {
    id: number;
    code: string;
    description: string;
    category: string;
}

export interface UserRole {
    id: number;
    name: string;
    description: string;
    permissions?: UserPermission[];
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    permissions: string[]; // Array of permission codes
}

interface UserContextValue {
    user: () => User | null;
    permissions: () => string[];
    isLoading: () => boolean;
    hasPermission: (code: string) => boolean;
    hasAnyPermission: (codes: string[]) => boolean;
    hasAllPermissions: (codes: string[]) => boolean;
    setUser: (user: User | null) => void;
    loadUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>();

export const UserProvider: ParentComponent = (props) => {
    const [user, setUser] = createSignal<User | null>(null);
    const [isLoading, setIsLoading] = createSignal(true);

    // Derived permissions from user
    const permissions = (): string[] => {
        const u = user();
        if (!u) return [];

        // Get permissions from role.permissions if available (nested object)
        if (u.role?.permissions && Array.isArray(u.role.permissions)) {
            const perms = u.role.permissions;
            // Handle both object format {code: "..."} and string format
            if (perms.length > 0 && typeof perms[0] === 'object') {
                return perms.map(p => p.code);
            }
            // Already string array
            if (typeof perms[0] === 'string') {
                return perms as unknown as string[];
            }
        }

        // Fallback to user's permissions array (flat string array)
        if (u.permissions && Array.isArray(u.permissions)) {
            return u.permissions;
        }

        return [];
    };

    // Permission check utilities
    const hasPermission = (code: string): boolean => {
        const u = user();
        if (!u) return false;

        // Admin role always has all permissions
        if (u.role?.name === 'Admin') return true;

        const perms = permissions();
        // Debug log (remove in production)
        // console.log(`Checking permission '${code}' in:`, perms);
        return perms.includes(code);
    };

    const hasAnyPermission = (codes: string[]): boolean => {
        return codes.some(code => hasPermission(code));
    };

    const hasAllPermissions = (codes: string[]): boolean => {
        return codes.every(code => hasPermission(code));
    };

    // Load user from localStorage or API
    const loadUser = async () => {
        setIsLoading(true);
        try {
            // Try to get from localStorage first
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('pjp_user');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setUser(parsed);
                }
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load user on mount
    onMount(() => {
        loadUser();
    });

    // Sync user changes to localStorage
    createEffect(() => {
        const u = user();
        if (typeof window !== 'undefined') {
            if (u) {
                localStorage.setItem('pjp_user', JSON.stringify(u));
            }
        }
    });

    const value: UserContextValue = {
        user,
        permissions,
        isLoading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        setUser,
        loadUser,
    };

    return (
        <UserContext.Provider value={value}>
            {props.children}
        </UserContext.Provider>
    );
};

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

// Permission code constants (matching backend)
export const PERMISSIONS = {
    // Action permissions
    MERCHANT_CREATE: 'merchant:create',
    MERCHANT_READ: 'merchant:read',
    MERCHANT_UPDATE: 'merchant:update',
    MERCHANT_APPROVE: 'merchant:approve',
    TERMINAL_CREATE: 'terminal:create',
    TERMINAL_READ: 'terminal:read',
    TERMINAL_UPDATE: 'terminal:update',
    TERMINAL_APPROVE: 'terminal:approve',
    USER_MANAGE: 'user:manage',

    // Menu permissions
    MENU_DASHBOARD: 'menu:dashboard',
    MENU_ANALYTICS: 'menu:analytics',
    MENU_TERMINALS: 'menu:terminals',
    MENU_MERCHANTS: 'menu:merchants',
    MENU_TRANSACTIONS: 'menu:transactions',
    MENU_HELPDESK: 'menu:helpdesk',
    MENU_SETTINGS: 'menu:settings',
    MENU_ADMIN: 'menu:admin',
} as const;

export default UserContext;
