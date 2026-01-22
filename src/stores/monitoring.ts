/**
 * Monitoring Store
 * Real-time monitoring data with WebSocket integration
 */

import { createSignal, createRoot } from 'solid-js';
import type { Terminal, TerminalStatus, SystemStatus } from '~/types';

// Dashboard Stats
interface DashboardStats {
    activeTerminals: number;
    totalTerminals: number;
    successRate: number;
    transactionsPerMin: number;
    systemStatus: SystemStatus;
    totalVolume: number;
    failedCount: number;
    pendingCount: number;
}

// WebSocket message types
interface WSMessage {
    type: 'stats_update' | 'terminal_update' | 'alert';
    payload: unknown;
}

function createMonitoringStore() {
    // Dashboard stats
    const [stats, setStats] = createSignal<DashboardStats>({
        activeTerminals: 0,
        totalTerminals: 0,
        successRate: 0,
        transactionsPerMin: 0,
        systemStatus: 'HEALTHY',
        totalVolume: 0,
        failedCount: 0,
        pendingCount: 0,
    });

    // Terminal list
    const [terminals, setTerminals] = createSignal<Terminal[]>([]);

    // Connection status
    const [isConnected, setIsConnected] = createSignal(false);
    const [lastUpdated, setLastUpdated] = createSignal<Date | null>(null);

    // WebSocket connection
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    const RECONNECT_DELAY = 5000;

    const connect = () => {
        if (typeof window === 'undefined') return;

        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8002/ws/monitoring';

        try {
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('[Monitoring] WebSocket connected');
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const message: WSMessage = JSON.parse(event.data);
                    handleMessage(message);
                    setLastUpdated(new Date());
                } catch (err) {
                    console.error('[Monitoring] Failed to parse message:', err);
                }
            };

            ws.onclose = () => {
                console.log('[Monitoring] WebSocket disconnected');
                setIsConnected(false);
                scheduleReconnect();
            };

            ws.onerror = (error) => {
                console.error('[Monitoring] WebSocket error:', error);
            };
        } catch (error) {
            console.error('[Monitoring] Failed to connect:', error);
            scheduleReconnect();
        }
    };

    const disconnect = () => {
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        if (ws) {
            ws.close();
            ws = null;
        }
        setIsConnected(false);
    };

    const scheduleReconnect = () => {
        if (reconnectTimeout) return;
        reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            connect();
        }, RECONNECT_DELAY);
    };

    const handleMessage = (message: WSMessage) => {
        switch (message.type) {
            case 'stats_update':
                updateStats(message.payload as Partial<DashboardStats>);
                break;
            case 'terminal_update':
                updateTerminal(message.payload as Terminal);
                break;
            case 'alert':
                // Handle alerts - could trigger notification
                console.log('[Monitoring] Alert:', message.payload);
                break;
        }
    };

    const updateStats = (newStats: Partial<DashboardStats>) => {
        setStats((prev) => ({ ...prev, ...newStats }));
    };

    const updateTerminal = (terminal: Terminal) => {
        setTerminals((prev) => {
            const index = prev.findIndex((t) => t.id === terminal.id);
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = terminal;
                return updated;
            }
            return [...prev, terminal];
        });
    };

    // Manual refresh (for SSR initial load)
    const setInitialData = (initialStats: DashboardStats, initialTerminals: Terminal[]) => {
        setStats(initialStats);
        setTerminals(initialTerminals);
        setLastUpdated(new Date());
    };

    // Filter helpers
    const getTerminalsByStatus = (status: TerminalStatus) => {
        return terminals().filter((t) => t.status === status);
    };

    const getOnlineCount = () => getTerminalsByStatus('ONLINE').length;
    const getOfflineCount = () => getTerminalsByStatus('OFFLINE').length;
    const getErrorCount = () => getTerminalsByStatus('ERROR').length;

    return {
        // State
        stats,
        terminals,
        isConnected,
        lastUpdated,

        // Actions
        connect,
        disconnect,
        setInitialData,
        updateStats,

        // Helpers
        getTerminalsByStatus,
        getOnlineCount,
        getOfflineCount,
        getErrorCount,
    };
}

// Export singleton store
export const monitoringStore = createRoot(createMonitoringStore);

export default monitoringStore;
