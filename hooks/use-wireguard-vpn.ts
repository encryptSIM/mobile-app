import { useState, useEffect, useCallback } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';

const WireGuardVpnModule = NativeModules.WireGuardVpnModule;

export interface WireGuardConfig {
    privateKey: string;
    publicKey?: string;
    serverAddress: string;
    allowedIPs?: string[];
    serverPort?: number;
    dns?: string[];
    presharedKey?: string;
    persistentKeepalive?: number;
    interfaceAddresses?: string[];
}

export interface TunnelStatistics {
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
}

export type VPNStatus =
    | 'invalid'
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'reasserting'
    | 'disconnecting'
    | 'unknown';

interface UseWireGuardVpnReturn {
    isSupported: boolean;
    isInitialized: boolean;
    status: VPNStatus;
    statistics: TunnelStatistics | null;
    isLoading: boolean;
    error: string | null;
    initialize: () => Promise<void>;
    connect: (config: string) => Promise<void>;
    disconnect: () => Promise<void>;
    getStatus: () => Promise<void>;
    getStatistics: () => Promise<void>;
}

export const useWireGuardVpn = (): UseWireGuardVpnReturn => {
    const [isSupported, setIsSupported] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [status, setStatus] = useState<VPNStatus>('disconnected');
    const [statistics, setStatistics] = useState<TunnelStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get current status
    const getStatus = useCallback(async () => {
        try {
            const currentStatus = await WireGuardVpnModule.getStatus();
            setStatus(currentStatus as VPNStatus);
        } catch (err) {
            console.error('Failed to get VPN status:', err);
        }
    }, []);

    // Initialize the module
    const initialize = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Check if WireGuard is supported
            const supported = await WireGuardVpnModule.isSupported();
            setIsSupported(supported);

            if (!supported) {
                setError('WireGuard VPN is not supported on this device');
                return;
            }

            // Initialize the module
            await WireGuardVpnModule.initialize();
            setIsInitialized(true);

            // Get initial status
            await getStatus();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initialize WireGuard VPN';
            setError(errorMessage);
            console.error('WireGuard VPN initialization error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [getStatus]);

    // Connect to VPN
    const connect = useCallback(async (configString: string) => {
        try {
            setIsLoading(true);
            setError(null);

            if (!isInitialized) {
                await initialize();
            }

            await WireGuardVpnModule.connect({ config: configString });
            await getStatus();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect to VPN';
            setError(errorMessage);
            console.error('WireGuard VPN connection error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isInitialized, initialize, getStatus]);

    // Disconnect from VPN
    const disconnect = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            await WireGuardVpnModule.disconnect();
            await getStatus();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect from VPN';
            setError(errorMessage);
            console.error('WireGuard VPN disconnection error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [getStatus]);

    // Get tunnel statistics (SAFE: will not crash if function missing)
    const getStatistics = useCallback(async () => {
        try {
            if (typeof WireGuardVpnModule.getTunnelStatistics === 'function') {
                const stats = await WireGuardVpnModule.getTunnelStatistics();
                setStatistics(stats);
            } else {
                setStatistics(null);
            }
        } catch (err) {
            console.error('Failed to get tunnel statistics:', err);
        }
    }, []);

    // Set up event listeners
    useEffect(() => {
        const eventEmitter = new NativeEventEmitter(NativeModules.WireGuardVpnModule);

        const statusListener = eventEmitter.addListener('vpnStatusChanged', (data: { status: VPNStatus }) => {
            setStatus(data.status);
        });

        const errorListener = eventEmitter.addListener('vpnError', (data: { error: string }) => {
            setError(data.error);
        });

        // Initialize on mount
        initialize();

        // Cleanup
        return () => {
            statusListener.remove();
            errorListener.remove();
        };
    }, [initialize]);

    // Auto-refresh status and statistics when connected
    useEffect(() => {
        if (status === 'connected' && typeof WireGuardVpnModule.getTunnelStatistics === 'function') {
            const interval = setInterval(() => {
                getStatistics();
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [status, getStatistics]);

    return {
        isSupported,
        isInitialized,
        status,
        statistics,
        isLoading,
        error,
        initialize,
        connect,
        disconnect,
        getStatus,
        getStatistics,
    };
};
