import axiosClient from "./api-client";

type PackageRequest = {
    type: 'global' | 'local' | 'regional';
    country?: string;
}
export type EsimPackage = {
    id: string;
    price: number;
    day: number;
    data: string;
};

export type EsimOperator = {
    id: number;
    title: string;
    packages: EsimPackage[];
};

export type RegionPackage = {
    region: string;
    operators: EsimOperator[];
};
export const getPackages = (request: PackageRequest) => {
    return axiosClient.get("/packages", {
        params: {
            type: request.type,
            country: request.country
        }
    })
}