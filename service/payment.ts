import axiosClient from "./api-client";

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

export const createOrder = (data: CreateOrderRequest) => {
    console.log("Creating order", data);
    return axiosClient.post<CreateOrderResponse>("/order", data);
};

export const getOrder = (orderId: string) => {
    console.log("Fetching order", orderId);
    return axiosClient.get<GetOrderResponse>(`/order/${orderId}`, {
        validateStatus: (status) => [200, 204].includes(status),
    });
};
