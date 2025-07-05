// context/auth-context.tsx
import React, { createContext, useContext } from "react";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";

export type AuthContextType = {
  publicKey: string | null;
  deviceToken: string | null;
  loading: boolean;
  setValue: (value: string) => Promise<void>;
  deviceTokenLoading: boolean;
  setDeviceToken: (value: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  publicKey: null,
  deviceToken: null,
  loading: true,
  setValue: async () => {},
  deviceTokenLoading: true,
  setDeviceToken: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    value: publicKey,
    loading,
    setValue,
  } = useAsyncStorage<string>("publicKey");

  const {
    value: deviceToken,
    loading: deviceTokenLoading,
    setValue: setDeviceToken,
  } = useAsyncStorage<string>("deviceToken");

  console.log("🔄 AuthProvider state:", {
    publicKey,
    deviceToken,
    loading,
    deviceTokenLoading,
  });

  return (
    <AuthContext.Provider
      value={{
        publicKey,
        loading,
        setValue,
        deviceToken,
        deviceTokenLoading,
        setDeviceToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
