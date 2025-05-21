import { useEffect, useState } from "react";
import { getOrderResult, getOrderResultDummy, type GetOrderResponse } from "@/service/payment";
import { errorLog } from "@/service/error-log";
const POLLING_INTERVAL = 5000;
const POLLING_TIMEOUT = 10 * 60 * 1000;

export const useOrderPolling = (
    orderId: string | null,
    isEnabled: boolean,
    onSuccess?: (order: GetOrderResponse) => void,
    onError?: (error: string) => void
) => {
    const [isPolling, setIsPolling] = useState(false);
    const [orderStatus, setOrderStatus] = useState<GetOrderResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId || !isEnabled) return;

        let isCancelled = false;
        const startTime = Date.now();

        const poll = async () => {
            setIsPolling(true);

            while (Date.now() - startTime < POLLING_TIMEOUT && !isCancelled) {
                try {
                    const res = await getOrderResult(orderId);

                    if (res.error) {
                        const errMsg = res.error;
                        setError(errMsg);
                        onError?.(errMsg);
                        break;
                    }

                    if (res.data) {
                        setOrderStatus(res.data);
                        if (res.data.sim) {
                            onSuccess?.(res.data);
                            break;
                        }
                    }
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        await errorLog(err);
                    } else {
                        await errorLog("Error fetching order status: Unknown error");
                    }
                    const errMsg = "Error fetching order status";
                    setError(errMsg);
                    onError?.(errMsg);
                    break;
                }

                await new Promise((r) => setTimeout(r, POLLING_INTERVAL));
            }

            setIsPolling(false);
        };

        poll();

        return () => {
            isCancelled = true;
        };
    }, [orderId, isEnabled]);

    return { isPolling, orderStatus, error };
};
