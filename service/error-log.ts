import axios from "axios";
import axiosClient from "./api-client";

export const errorLog = (error: Error | string) => {
    return axiosClient.post("/error", {
        message: error instanceof Error ? error.message : error,
    });
};
