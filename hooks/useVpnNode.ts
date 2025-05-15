
import { useState } from "react";
import { findWorkingVpnNode } from "../service/vpnService";

export function useVpnNode() {
  const [loading, setLoading] = useState(false);

  const findNode = async () => {
    setLoading(true);
    try {
      const node = await findWorkingVpnNode();
      return node;
    } catch (error) {
      console.error("Error finding VPN node:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { findNode, loading };
}
