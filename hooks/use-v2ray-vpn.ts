import { useState, useCallback } from 'react';
import { NativeModules } from 'react-native';

const { V2RayModule } = NativeModules;

type StatusType = 'unknown' | 'running' | 'stopped';

export function useV2RayVpn() {
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [status, setStatus] = useState<StatusType>('unknown');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Set basekey (hex or base64 string)
    const setBasekey = useCallback(async (basekeyString: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await V2RayModule.setBasekey(basekeyString);
            setLoading(false);
            return result;
        } catch (err: any) {
            setError(err.message || String(err));
            setLoading(false);
            throw err;
        }
    }, []);

    // Start VPN (using VPN service for actual tunnel)
    const startVpn = useCallback(async (vmessLink: string) => {
        setLoading(true);
        setError(null);
        try {
            // Use VPN service instead of local proxy for actual VPN tunnel
            const res = await V2RayModule.startVpnService(vmessLink);
            setIsRunning(true);
            setStatus('running');
            setLoading(false);
            return res;
        } catch (err: any) {
            setError(err.message || String(err));
            setIsRunning(false);
            setStatus('stopped');
            setLoading(false);
            throw err;
        }
    }, []);

    // Stop VPN (stop VPN service)
    const stopVpn = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Stop VPN service instead of just the core
            const res = await V2RayModule.stopVpnService();
            setIsRunning(false);
            setStatus('stopped');
            setLoading(false);
            return res;
        } catch (err: any) {
            setError(err.message || String(err));
            setLoading(false);
            throw err;
        }
    }, []);

    // Start as local proxy only (for testing/backup)
    const startLocalProxy = useCallback(async (vmessLink: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await V2RayModule.startWithVmessLink(vmessLink);
            setIsRunning(true);
            setStatus('running');
            setLoading(false);
            return res;
        } catch (err: any) {
            setError(err.message || String(err));
            setIsRunning(false);
            setStatus('stopped');
            setLoading(false);
            throw err;
        }
    }, []);

    // Stop local proxy only
    const stopLocalProxy = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await V2RayModule.stop();
            setIsRunning(false);
            setStatus('stopped');
            setLoading(false);
            return res;
        } catch (err: any) {
            setError(err.message || String(err));
            setLoading(false);
            throw err;
        }
    }, []);

    // Get basekey file path
    const getBasekeyFilePath = useCallback(async (): Promise<string> => {
        try {
            const path = await V2RayModule.getBaseKeyFilePath();
            return path;
        } catch (err: any) {
            setError(err.message || String(err));
            throw err;
        }
    }, []);

    // Get VPN status
    const getStatus = useCallback(async () => {
        try {
            const statusResult = await V2RayModule.getStatus();
            setStatus(statusResult.status as StatusType);
            setIsRunning(statusResult.status === 'running');
            return statusResult;
        } catch (err: any) {
            setError(err.message || String(err));
            setStatus('unknown');
            throw err;
        }
    }, []);

    // Check V2Ray version
    const getVersion = useCallback(async () => {
        try {
            const version = await V2RayModule.checkVersion();
            return version;
        } catch (err: any) {
            setError(err.message || String(err));
            throw err;
        }
    }, []);

    return {
        isRunning,
        status,
        error,
        loading,
        // VPN service methods (actual VPN tunnel)
        startVpn,
        stopVpn,
        // Local proxy methods (backup/testing)
        startLocalProxy,
        stopLocalProxy,
        // Utility methods
        setBasekey,
        getBasekeyFilePath,
        getStatus,
        getVersion,
    };
}
