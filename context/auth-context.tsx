// context/auth-context.tsx
import React, { createContext, useContext } from "react";
import { useAsyncStorage } from "@/hooks/asyn-storage-hook";

export type AuthContextType = {
  publicKey: string | null;
  loading: boolean;
  setValue: (value: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  publicKey: null,
  loading: true,
  setValue: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    value: publicKey,
    loading,
    setValue,
  } = useAsyncStorage<string>("publicKey");

  return (
    <AuthContext.Provider value={{ publicKey, loading, setValue }}>
      {children}
    </AuthContext.Provider>
  );
};
