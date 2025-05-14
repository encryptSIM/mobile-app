import axiosClient, { APIError } from "./api-client";

type PackageRequest = {
    type: 'global' | 'local' | 'regional';
    country?: string;
}

export type EsimPackage = {
    id: string;
    data: string;
    day: number;
    price: string;
    operator: string;
    region: string;
}

export type RegionPackage = {
    region: string;
    operators: {
        name: string;
        packages: EsimPackage[];
    }[];
}

export type PackageResponse = {
    data: RegionPackage[];
    loading: boolean;
    error: string | null;
}

export const getPackages = async (request: PackageRequest): Promise<PackageResponse> => {
    try {
        const response = await axiosClient.get("/packages", {
            params: {
                type: request.type,
                country: request.country
            }
        });
        return {
            data: response.data,
            loading: false,
            error: null
        };
    } catch (error) {
        if (error instanceof APIError) {
            return {
                data: [],
                loading: false,
                error: error.message
            };
        }
        return {
            data: [],
            loading: false,
            error: 'Failed to fetch packages'
        };
    }
}