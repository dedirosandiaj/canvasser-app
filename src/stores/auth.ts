/**
 * Auth Store
 * Manages authentication state, JWT tokens, and user session
 */

import { createSignal, createRoot } from 'solid-js';

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'operator' | 'viewer';
    permissions?: string[];
    avatar?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
}

// Storage keys
const TOKEN_KEY = 'pjp_auth_token';
const USER_KEY = 'pjp_auth_user';

// Create store in a root to prevent disposal
function createAuthStore() {
    // Initialize from localStorage (only in browser)
    const getInitialToken = (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    };

    const getInitialUser = (): User | null => {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(USER_KEY);
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    };

    // Signals
    const [user, setUser] = createSignal<User | null>(getInitialUser());
    const [token, setToken] = createSignal<string | null>(getInitialToken());
    const [isLoading, setIsLoading] = createSignal(false);

    // Computed
    const isAuthenticated = () => !!token() && !!user();

    // Actions
    const fetchUser = async (): Promise<User | null> => {
        try {
            const response = await fetch('http://localhost:8001/api/v1/auth/me', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                // If token is in header or cookie, we might extract it if needed, but for now we rely on cookie
                return data.user;
            }
            return null;
        } catch (e) {
            console.error('Failed to fetch user', e);
            return null;
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8001/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            // Store user data
            setUser(data.user);

            // If backend returns token in body, store it for header usage
            // The current backend impl returns { user: ... }, token is in cookie.
            // So token() signal might be empty, but cookies work.
            if (data.token) {
                setToken(data.token);
                if (typeof window !== 'undefined') {
                    localStorage.setItem(TOKEN_KEY, data.token);
                }
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }

            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Call backend logout to clear cookies
            await fetch('http://localhost:8001/api/v1/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (e) {
            console.error("Logout failed", e);
        }

        setToken(null);
        setUser(null);

        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }

        // Redirect to login
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    // Initialize user session on store creation (client-only)
    if (typeof window !== 'undefined') {
        fetchUser();
    }

    const updateUser = (updates: Partial<User>) => {
        const current = user();
        if (current) {
            const updated = { ...current, ...updates };
            setUser(updated);
            if (typeof window !== 'undefined') {
                localStorage.setItem(USER_KEY, JSON.stringify(updated));
            }
        }
    };

    // For server-side token injection (SSR)
    const setAuthFromServer = (serverToken: string, serverUser: User) => {
        setToken(serverToken);
        setUser(serverUser);
    };

    return {
        // State (readonly)
        user,
        token,
        isLoading,
        isAuthenticated,

        // Actions
        login,
        logout,
        fetchUser,
        updateUser,
        setAuthFromServer,
    };
}

// Export singleton store
export const authStore = createRoot(createAuthStore);

// Utility function to get token (for API client)
export function getAuthToken(): string | null {
    return authStore.token();
}

export default authStore;
