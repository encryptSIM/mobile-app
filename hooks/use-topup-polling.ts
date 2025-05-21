import { useEffect, useState } from "react";
import { getTopUpResult, type TopUpResult } from "@/service/payment";
import { errorLog } from "@/service/error-log";

const POLLING_INTERVAL = 5000;
const POLLING_TIMEOUT = 10 * 60 * 1000;

export const useTopUpPolling = (
    transactionId: string | null,
    isEnabled: boolean,
    paymentInSol: number | null,
    onSuccess?: (result: TopUpResult, paymentInSol: number) => void,
    onError?: (error: string) => void
) => {
    const [isPolling, setIsPolling] = useState(false);
    const [topUpStatus, setTopUpStatus] = useState<TopUpResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!transactionId || !isEnabled) return;

        let isCancelled = false;
        const startTime = Date.now();

        const poll = async () => {
            setIsPolling(true);

            while (Date.now() - startTime < POLLING_TIMEOUT && !isCancelled) {
                try {
                    const res = await getTopUpResult(transactionId);

                    if (res.error) {
                        const errMsg = res.error;
                        setError(errMsg);
                        onError?.(errMsg);
                        break;
                    }

                    const data = res.data;

                    if (data) {
                        setTopUpStatus(data);

                        if (data.status === "esim_provisioned") {
                            onSuccess?.(data, paymentInSol!);
                            break;
                        }

                        if (data.status === "FAILED") {
                            const errMsg = "Top-up processing failed.";
                            setError(errMsg);
                            onError?.(errMsg);
                            break;
                        }
                    }
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        await errorLog(err);
                    } else {
                        await errorLog("Error fetching top-up status: Unknown error");
                    }
                    const errMsg = "Error fetching top-up status";
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
    }, [transactionId, isEnabled]);

    return { isPolling, topUpStatus, error };
};
