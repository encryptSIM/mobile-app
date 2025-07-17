// vpn-service.ts
import axiosClient, { APIError } from './api-client';

/**
 * Create a new device and return its token.
 */
export async function createDevice(): Promise<string> {
    try {
        console.log("🔄 Creating device with API URL:", process.env.EXPO_PUBLIC_API_URL);
        const res = await axiosClient.post('/vpn/create-device');
        console.log("✅ createDevice full response:", JSON.stringify(res.data, null, 2));

        if (!res.data) {
            throw new Error("No data in response");
        }

        // The API returns { data: { token: "...", ... } }
        const token = res.data.data?.token;
        if (!token) {
            console.error("❌ No token found in response. Response structure:", res.data);
            throw new Error("No token found in API response");
        }

        console.log("✅ Device token created successfully:", token);
        return token as string;
    } catch (error: any) {
        console.error("❌ createDevice error details:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
        });
        throw new APIError('Failed to create device', error.response?.status, error.response?.data);
    }
}

/**
 * Get available countries for a device.
 */
export async function getCountries(deviceToken: string) {
    try {
        const res = await axiosClient.get(`/vpn/countries/${deviceToken}`);
        return res.data;
    } catch (error: any) {
        throw new APIError('Failed to get countries', error.response?.status, error.response?.data);
    }
}

/**
 * Get available cities for a country and device.
 */
export async function getCities(countryId: string, deviceToken: string) {
    try {
        const res = await axiosClient.get(`/vpn/cities/${countryId}`, {
            params: { deviceToken },
        });
        return res.data;
    } catch (error: any) {
        throw new APIError('Failed to get cities', error.response?.status, error.response?.data);
    }
}

/**
 * Get available servers for a city and device.
 */
export async function getServers(cityId: string, deviceToken: string) {
    try {
        const res = await axiosClient.get(`/vpn/servers/${cityId}`, {
            params: { deviceToken },
        });
        return res.data;
    } catch (error: any) {
        throw new APIError('Failed to get servers', error.response?.status, error.response?.data);
    }
}

/**
 * Create credentials (WireGuard config object) for a server and device.
 * @returns { config: object, ... }
 */
export async function createCredentials(serverId: string, deviceToken: string) {
    try {
        console.log('🔄 Creating credentials with params:', {
            serverId,
            deviceToken,
            url: `/vpn/create-credentials/${serverId}`
        });

        // Send deviceToken as query parameter (like other API calls)
        const res = await axiosClient.post(`/vpn/create-credentials/${serverId}`, {}, {
            params: { deviceToken },
        });

        console.log('✅ createCredentials response status:', res.status);
        console.log('✅ createCredentials response data:', JSON.stringify(res.data, null, 2));

        if (!res.data) {
            throw new Error('No data in credentials response');
        }

        return res.data;
    } catch (error: any) {
        console.error('❌ createCredentials error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method,
            params: error.config?.params,
            headers: error.config?.headers
        });

        // Provide more specific error messages based on status code
        let errorMessage = 'Failed to create credentials';
        if (error.response?.status === 404) {
            errorMessage = 'Server not found or invalid server ID';
        } else if (error.response?.status === 401) {
            errorMessage = 'Invalid device token or unauthorized access';
        } else if (error.response?.status === 400) {
            errorMessage = 'Bad request - invalid parameters';
        } else if (error.response?.status >= 500) {
            errorMessage = 'Server error - please try again later';
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }

        throw new APIError(errorMessage, error.response?.status, error.response?.data);
    }
}

/**
 * Get the active VPN config (WireGuard config object) for a device.
 * @returns { config: object, ... }
 */
export async function active(deviceToken?: string) {
    try {
        const res = await axiosClient.post('/vpn/active', { deviceToken });
        return res.data;
    } catch (error: any) {
        throw new APIError('Failed to get active VPN config', error.response?.status, error.response?.data);
    }
}

/**
 * Example: Get full WireGuard config object for the first available server.
 * @returns { config: object, ... }
 */
export async function getWireGuardConfig() {
    const deviceToken = await createDevice();
    const countries = await getCountries(deviceToken);
    const countryId = countries[0].id;
    const cities = await getCities(countryId, deviceToken);
    const cityId = cities[0].id;
    const servers = await getServers(cityId, deviceToken);
    const serverId = servers[0].id;
    const credentials = await createCredentials(serverId, deviceToken);
    // credentials.config is the JS object for buildConfig
    return credentials;
}

/**
 * Helper: Get a ready-to-use WireGuard config string for the first available server.
 * Requires you to pass in the buildConfig function from your hook.
 */
export async function getWireGuardConfigString(buildConfig: (config: any) => string) {
    const credentials = await getWireGuardConfig();
    return buildConfig(credentials.config);
}
