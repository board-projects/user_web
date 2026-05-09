import RequestService from "@/services/RequestService";

const sendOtpRequest = new RequestService("/auth/send-otp");
const verifyOtpRequest = new RequestService("/auth/verify-otp");

export const authApi = {
    sendOtp: async (email: string) => {
        return await sendOtpRequest.post({ email });
    },

    verifyOtp: async (email: string, code: string) => {
        return await verifyOtpRequest.post({ email, code });
    }
}