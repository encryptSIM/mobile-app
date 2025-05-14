import axiosClient, { APIError } from "./api-client";

export type CreateOrderRequest = {
    ppPublicKey: string;
    quantity: number;
    package_id: string;
    package_price: string; // or number, depends on backend
};

export type CreateOrderResponse = {
    orderId: string;
};

export type SimInfo = {
    created_at: string;
    direct_apple_installation_url: string;
    iccid: string;
    qrcode: string;
    qrcode_url: string;
};

export type GetOrderResponse = {
    orderId: string;
    sim?: SimInfo;
    status: string;
};

export type GetOrderHistoryResponse = {
    orderId: string;
    package_id: string;
    iccid: string;
};

export type TopUpRequest = {
    ppPublicKey: string;
    package_id: string;
    iccid: string;
    package_price: string;
};

export type TopUpResponse = {
    orderId: string;
    paymentInSol: number;
};

export type ServiceResponse<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
};

export const createOrder = async (data: CreateOrderRequest): Promise<ServiceResponse<CreateOrderResponse>> => {
    try {
        const response = await axiosClient.post<CreateOrderResponse>("/order", data);
        return {
            data: response.data,
            loading: false,
            error: null
        };
    } catch (error) {
        if (error instanceof APIError) {
            return {
                data: null,
                loading: false,
                error: error.message
            };
        }
        return {
            data: null,
            loading: false,
            error: 'Failed to create order'
        };
    }
};

export const getOrder = async (orderId: string): Promise<ServiceResponse<GetOrderResponse>> => {
    try {
        const response = await axiosClient.get<GetOrderResponse>(`/order/${orderId}`, {
            validateStatus: (status) => [200, 204].includes(status),
        });
        return {
            data: response.status === 200 ? response.data : null,
            loading: false,
            error: null
        };
    } catch (error) {
        if (error instanceof APIError) {
            return {
                data: null,
                loading: false,
                error: error.message
            };
        }
        return {
            data: null,
            loading: false,
            error: 'Failed to fetch order'
        };
    }
};

export const getOrderHistory = async (address: string): Promise<ServiceResponse<GetOrderHistoryResponse[]>> => {
    try {
        const response = await axiosClient.get<GetOrderHistoryResponse[]>(`payment-profile/sim/${address}`);
        return {
            data: response.data,
            loading: false,
            error: null
        };
    } catch (error) {
        if (error instanceof APIError) {
            return {
                data: null,
                loading: false,
                error: error.message
            };
        }
        return {
            data: null,
            loading: false,
            error: 'Failed to fetch order history'
        };
    }
};

export const getTopUpOptions = async (iccid: string): Promise<ServiceResponse<any>> => {
    try {
        const response = await axiosClient.get(`/sim/${iccid}/topups`);
        return {
            data: response.data,
            loading: false,
            error: null
        };
    } catch (error) {
        if (error instanceof APIError) {
            return {
                data: null,
                loading: false,
                error: error.message
            };
        }
        return {
            data: null,
            loading: false,
            error: 'Failed to fetch top-up options'
        };
    }
};

export const createTopUp = async (data: TopUpRequest): Promise<ServiceResponse<TopUpResponse>> => {
    try {
        const response = await axiosClient.post<TopUpResponse>("/topup", data);
        return {
            data: response.data,
            loading: false,
            error: null
        };
    } catch (error) {
        if (error instanceof APIError) {
            return {
                data: null,
                loading: false,
                error: error.message
            };
        }
        return {
            data: null,
            loading: false,
            error: 'Failed to create top-up'
        };
    }
};
