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

interface UsageData {
    remaining: number;
    total: number;
    expired_at: string | null;
    is_unlimited: boolean;
    status: string;
    remaining_voice: number;
    remaining_text: number;
    total_voice: number;
    total_text: number;
}

export type GetOrderHistoryResponse = {
    orderId: string;
    package_id: string;
    iccid: string;
    usage_data: UsageData;
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

export interface TopUp {
    currency: string;
    data: string;
    description: string;
    esim_type: string;
    id: number;
    net_price: number;
    package_id: string;
    price: number;
    quantity: number;
}

export interface TopUpResult {
    orderId: string;
    status: string;
    topup: TopUp;
}

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

export const getTopUpResult = async (topupId: string): Promise<ServiceResponse<TopUpResult>> => {
    try {
        const response = await axiosClient.get(`/topup/${topupId}`);
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
            error: 'Failed to fetch top-up result'
        };
    }
};

//
export const getTopUpResultDummy = async (topupId: string): Promise<ServiceResponse<TopUpResult>> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const dummyData: TopUpResult = {
        "orderId": "6b174c7e-f256-4fd7-b53a-5a1deefb1920",
        "status": "esim_provisioned",
        "topup": {
            "currency": "USD",
            "data": "1 GB",
            "description": "",
            "esim_type": "Prepaid",
            "id": 648329,
            "net_price": 1.7,
            "package_id": "asialink-7days-1gb-topup",
            "price": 5,
            "quantity": 1
        }
    };

    // Simulate a successful response
    if (topupId) { // just to use the param to avoid lint error
        return {
            data: dummyData,
            loading: false,
            error: null
        };
    }

    // Simulate an error response (optional, can be adjusted based on needs)
    return {
        data: null,
        loading: false,
        error: 'Failed to fetch top-up result (dummy)'
    };
};

export const getOrderResultDummy = async (orderId: string): Promise<ServiceResponse<GetOrderResponse>> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const dummyData: GetOrderResponse = {
        "orderId": "8ad5887d-cbde-4e50-98c7-b950b62973d2",
        "status": "esim_provisioned",
        "sim": {
            "created_at": "2025-05-12 14:30:29",
            "direct_apple_installation_url": "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:1$wbg.prod.ondemandconnectivity.com$O2HGRNYNZW4E3SQZ",
            "iccid": "89852351124650001390",
            "qrcode": "LPA:1$wbg.prod.ondemandconnectivity.com$O2HGRNYNZW4E3SQZ",
            "qrcode_url": "https://www.airalo.com/qr?expires=1833373829&id=44482013&signature=519c38bae149c991e1996a26e9b5935d4be02206c955bd4cf40475cc722693b7"
        }
    };

    // Simulate a successful response
    // We use the orderId parameter to avoid lint errors about unused variables
    if (orderId === dummyData.orderId || orderId !== "") {
        return {
            data: dummyData,
            loading: false,
            error: null
        };
    }

    // Simulate an error response if the orderId doesn't match (or handle as needed)
    return {
        data: null,
        loading: false,
        error: 'Failed to fetch order result (dummy) - Order ID mismatch'
    };
};