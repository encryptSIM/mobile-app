interface VPNNode {
    url: string;
    config: any;
    type: 'wireguard' | 'openvpn';
}

export const getNodes = async () => {
    try {
        const res = await fetch("https://lcd.sentinel.co/sentinel/nodes");
        const data = await res.json();

        const nodes = data.nodes;
        console.log("✅ Found", nodes.length, "nodes");

        return nodes;
    } catch (err) {
        console.error("❌ Fetch failed:", err);
        return [];
    }
};

export const findWorkingVpnNode = async (): Promise<VPNNode> => {
    console.log("🔍 Looking for VPN nodes (WireGuard/OpenVPN)");

    const nodes = await getNodes();
    console.log("🔢 Total nodes:", nodes.length);

    for (const node of nodes) {
        const url = node.remote_url?.replace(/\/$/, "");
        if (!url) continue;

        // 🔐 Try WireGuard
        try {
            const res = await fetch(`${url}/wireguard`);
            if (res.ok) {
                const data = await res.json();
                console.log("✅ WireGuard supported at:", url);
                return { url, config: data, type: "wireguard" };
            }
        } catch (err) {
            console.log("⛔️ No WireGuard at:", url);
        }

        // 🔐 Try OpenVPN
        try {
            const res = await fetch(`${url}/openvpn`);
            if (res.ok) {
                const data = await res.text();
                console.log("✅ OpenVPN supported at:", url);
                return { url, config: data, type: "openvpn" };
            }
        } catch (err) {
            console.log("⛔️ No OpenVPN at:", url);
        }

        console.log("❌ Skipped node (no VPN):", url);
    }

    throw new Error("No working node with WireGuard or OpenVPN found");
}; 