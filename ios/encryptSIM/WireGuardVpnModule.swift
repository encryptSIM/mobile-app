import Foundation
import NetworkExtension
import React

@objc(WireGuardVpnModule)
class WireGuardVpnModule: RCTEventEmitter {
    
    private var manager: NETunnelProviderManager?
    private var isObserving = false
    
    override init() {
        super.init()
        setupVPNManager()
    }
    
    override func supportedEvents() -> [String]! {
        return ["vpnStatusChanged", "vpnError"]
    }
    
    private func setupVPNManager() {
        NETunnelProviderManager.loadAllFromPreferences { [weak self] (managers, error) in
            DispatchQueue.main.async {
                if let error = error {
                    print("Error loading VPN preferences: \(error)")
                    return
                }
                
                if let managers = managers, !managers.isEmpty {
                    self?.manager = managers.first
                } else {
                    self?.manager = NETunnelProviderManager()
                }
                
                self?.startObserving()
            }
        }
    }
    
    private func startObserving() {
        guard !isObserving, let manager = manager else { return }
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(vpnStatusDidChange),
            name: .NEVPNStatusDidChange,
            object: manager.connection
        )
        
        isObserving = true
    }
    
    @objc private func vpnStatusDidChange() {
        guard let manager = manager else { return }
        
        let status = getVPNStatusString(manager.connection.status)
        sendEvent(withName: "vpnStatusChanged", body: ["status": status])
    }
    
    private func getVPNStatusString(_ status: NEVPNStatus) -> String {
        switch status {
        case .invalid:
            return "invalid"
        case .disconnected:
            return "disconnected"
        case .connecting:
            return "connecting"
        case .connected:
            return "connected"
        case .reasserting:
            return "reasserting"
        case .disconnecting:
            return "disconnecting"
        @unknown default:
            return "unknown"
        }
    }
    
    @objc
    func initialize(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("INIT_ERROR", "Module not available", nil)
                return
            }
            
            print("Initializing WireGuard VPN module")
            resolve(true)
        }
    }
    
    @objc
    func isSupported(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            // Check if NetworkExtension framework is available
            let isSupported = NEVPNManager.self != nil
            print("WireGuard support check: \(isSupported)")
            resolve(isSupported)
        }
    }
    
    @objc
    func connect(_ config: [String: Any], resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("CONNECTION_ERROR", "Module not available", nil)
                return
            }
            
            do {
                print("Connecting to WireGuard VPN with config: \(config)")
                
                // Create WireGuard configuration
                let wireGuardConfig = try self.createWireGuardConfiguration(from: config)
                
                // Configure the VPN manager
                self.manager?.protocolConfiguration = wireGuardConfig
                self.manager?.localizedDescription = "WireGuard VPN"
                self.manager?.isEnabled = true
                
                // Save configuration
                self.manager?.saveToPreferences { error in
                    if let error = error {
                        print("Error saving VPN configuration: \(error)")
                        reject("CONNECTION_ERROR", "Failed to save VPN configuration", error)
                        return
                    }
                    
                    // Start the VPN connection
                    do {
                        try self.manager?.connection.startVPNTunnel()
                        print("WireGuard VPN connection started")
                        resolve(true)
                    } catch {
                        print("Error starting VPN tunnel: \(error)")
                        reject("CONNECTION_ERROR", "Failed to start VPN tunnel", error)
                    }
                }
                
            } catch {
                print("Error creating WireGuard configuration: \(error)")
                reject("CONNECTION_ERROR", "Failed to create WireGuard configuration", error)
            }
        }
    }
    
    @objc
    func disconnect(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let manager = self.manager else {
                reject("DISCONNECTION_ERROR", "VPN manager not available", nil)
                return
            }
            
            print("Disconnecting from WireGuard VPN")
            
            manager.connection.stopVPNTunnel()
            print("WireGuard VPN disconnection initiated")
            resolve(true)
        }
    }
    
    @objc
    func getStatus(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let manager = self.manager else {
                resolve("disconnected")
                return
            }
            
            let status = self.getVPNStatusString(manager.connection.status)
            print("WireGuard VPN status: \(status)")
            resolve(status)
        }
    }
    
    @objc
    func getTunnelStatistics(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let manager = self.manager else {
                resolve(nil)
                return
            }
            
            // Request statistics from the tunnel provider
            let message = ["request": "getStatistics"]
            manager.connection.sendProviderMessage(Data(message.description.utf8)) { responseData in
                if let responseData = responseData,
                   let responseString = String(data: responseData, encoding: .utf8) {
                    // Parse the response and return statistics
                    // This is a simplified implementation
                    let stats: [String: Any] = [
                        "bytesReceived": 0,
                        "bytesSent": 0,
                        "packetsReceived": 0,
                        "packetsSent": 0
                    ]
                    resolve(stats)
                } else {
                    resolve(nil)
                }
            }
        }
    }
    
    private func createWireGuardConfiguration(from config: [String: Any]) throws -> NETunnelProviderProtocol {
        guard let privateKey = config["privateKey"] as? String,
              let serverAddress = config["serverAddress"] as? String else {
            throw NSError(domain: "WireGuardConfig", code: 1, userInfo: [NSLocalizedDescriptionKey: "Missing required configuration parameters"])
        }
        
        let allowedIPs = config["allowedIPs"] as? [String] ?? ["0.0.0.0/0"]
        let dns = config["dns"] as? [String] ?? ["8.8.8.8"]
        
        // Parse server address and port
        let serverParts = serverAddress.split(separator: ":")
        let serverHost = String(serverParts[0])
        let serverPort = serverParts.count > 1 ? Int(serverParts[1]) ?? 51820 : 51820
        
        // Create WireGuard configuration string
        var wireGuardConfig = """
        [Interface]
        PrivateKey = \(privateKey)
        Address = 10.0.0.2/24
        DNS = \(dns.joined(separator: ", "))
        
        [Peer]
        PublicKey = \(config["publicKey"] as? String ?? privateKey)
        AllowedIPs = \(allowedIPs.joined(separator: ", "))
        Endpoint = \(serverHost):\(serverPort)
        PersistentKeepalive = 25
        """
        
        let protocolConfig = NETunnelProviderProtocol()
        protocolConfig.serverAddress = serverHost
        protocolConfig.username = "wireguard"
        protocolConfig.providerBundleIdentifier = "com.giachan2002.encryptsim.wireguard"
        
        // Store the WireGuard configuration in the provider configuration
        protocolConfig.providerConfiguration = [
            "wireguardConfig": wireGuardConfig
        ]
        
        return protocolConfig
    }
    
    deinit {
        if isObserving {
            NotificationCenter.default.removeObserver(self)
        }
    }
} 