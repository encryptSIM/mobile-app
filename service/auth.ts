import axiosClient from "./api-client"


export const createPaymentProfile = () => {
    console.log("Creating payment profile")
    return axiosClient.post("/create-payment-profile")
}
