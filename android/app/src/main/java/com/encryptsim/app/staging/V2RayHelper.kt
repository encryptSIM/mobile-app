package com.encryptsim.app.staging

import android.content.Context
import android.util.Base64
import android.util.Log
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import libv2ray.Libv2ray
import libv2ray.CoreController
import libv2ray.CoreCallbackHandler

object V2RayHelper {
    private const val TAG = "V2RayHelper"
    private val assetFiles = listOf("geoip.dat", "geosite.dat")

    private var coreController: CoreController? = null
    private var currentConfig: String? = null
    private var isInitialized = false

    // --- Panic-Resistant BaseKey Management ---
    private var vpnMode = false

    fun enableVpnMode(enabled: Boolean) {
        vpnMode = enabled
        Log.d(TAG, "[enableVpnMode] VPN mode: $enabled")
    }

    private fun ensureValidBaseKey(context: Context): File {
        Log.d(TAG, "[ensureValidBaseKey] Starting basekey setup")
        val baseKey = File(context.filesDir, "basekey")
        
        try {
            // Generate secure 32-byte key
            val bytes = ByteArray(32)
            java.security.SecureRandom().nextBytes(bytes)
            
            // Always recreate basekey to avoid corruption issues
            if (baseKey.exists()) {
                baseKey.delete()
                Log.d(TAG, "[ensureValidBaseKey] Deleted existing basekey")
            }
            
            baseKey.writeBytes(bytes)
            Log.d(TAG, "[ensureValidBaseKey] Created fresh basekey: ${baseKey.absolutePath} (${baseKey.length()} bytes)")
            
            return baseKey
        } catch (e: Exception) {
            Log.e(TAG, "[ensureValidBaseKey] Failed to create basekey: ${e.message}", e)
            throw RuntimeException("Basekey creation failed", e)
        }
    }

    // --- Safe Asset Management ---

    private fun copyAssets(context: Context) {
        Log.d(TAG, "[copyAssets] Copying assets safely")
        val assetManager = context.assets
        
        for (name in assetFiles) {
            try {
                val outFile = File(context.filesDir, name)
                
                // Always copy fresh assets to avoid corruption
                if (outFile.exists()) {
                    outFile.delete()
                    Log.d(TAG, "[copyAssets] Deleted existing $name")
                }
                
                Log.d(TAG, "[copyAssets] Copying $name...")
                assetManager.open(name).use { inStream ->
                    FileOutputStream(outFile).use { outStream ->
                        val buffer = ByteArray(8192)
                        var bytesRead: Int
                        while (inStream.read(buffer).also { bytesRead = it } != -1) {
                            outStream.write(buffer, 0, bytesRead)
                        }
                    }
                }
                Log.d(TAG, "[copyAssets] Successfully copied $name (${outFile.length()} bytes)")
            } catch (e: IOException) {
                Log.e(TAG, "[copyAssets] Failed to copy $name: ${e.message}", e)
                throw RuntimeException("Asset copy failed for $name", e)
            }
        }
        Log.d(TAG, "[copyAssets] All assets copied successfully")
    }

    private fun verifyAssets(context: Context): Boolean {
        Log.d(TAG, "[verifyAssets] Verifying all assets exist")
        
        for (name in assetFiles) {
            val file = File(context.filesDir, name)
            if (!file.exists() || file.length() == 0L) {
                Log.e(TAG, "[verifyAssets] $name is missing or empty!")
                return false
            }
            Log.d(TAG, "[verifyAssets] $name verified (${file.length()} bytes)")
        }
        return true
    }

    // --- Safe V2Ray Core Callback Handler ---

    private class V2RayCallbackHandler : CoreCallbackHandler {
        override fun onEmitStatus(code: Long, message: String): Long {
            when (code) {
                0L -> Log.d(TAG, "[Core] STATUS: $message")
                1L -> Log.w(TAG, "[Core] WARNING: $message")
                2L -> Log.e(TAG, "[Core] ERROR: $message")
                else -> Log.i(TAG, "[Core] [$code]: $message")
                
            }
            return 0
        }
        
        override fun startup(): Long {
            Log.d(TAG, "[Core] STARTUP")
            return 0
        }
        
        override fun shutdown(): Long {
            Log.d(TAG, "[Core] SHUTDOWN")
            return 0
        }
    }

    // --- Panic-Resistant Initialization ---

    fun initializeV2Ray(context: Context): Boolean {
        Log.d(TAG, "[initializeV2Ray] Starting panic-resistant initialization")
        
        if (isInitialized) {
            Log.d(TAG, "[initializeV2Ray] Already initialized")
            return true
        }
        
        try {
            // Step 1: Test library access first
            try {
                val version = Libv2ray.checkVersionX()
                Log.d(TAG, "[initializeV2Ray] Library OK, version: $version")
            } catch (e: Exception) {
                Log.e(TAG, "[initializeV2Ray] Library not accessible: ${e.message}", e)
                return false
            }

            // Step 2: Setup basekey (critical for panic prevention)
            val baseKeyFile = ensureValidBaseKey(context)

            // Step 3: Copy assets
            copyAssets(context)
            if (!verifyAssets(context)) {
                Log.e(TAG, "[initializeV2Ray] Asset verification failed")
                return false
            }

            // Step 4: Initialize core environment with panic protection
            val assetDir = context.filesDir.absolutePath
            Log.d(TAG, "[initializeV2Ray] Initializing core env: $assetDir")
            
            try {
                // Clear any previous state
                System.gc()
                Thread.sleep(100) // Give GC time
                
                // Initialize with the same directory for both parameters (v2rayNG pattern)
                Libv2ray.initCoreEnv(assetDir, assetDir)
                Log.d(TAG, "[initializeV2Ray] Core environment initialized successfully")
            } catch (e: Exception) {
                Log.e(TAG, "[initializeV2Ray] Core env init failed: ${e.message}", e)
                return false
            }

            // Step 5: Create core controller with safety checks
            try {
                coreController = Libv2ray.newCoreController(V2RayCallbackHandler())
                Log.d(TAG, "[initializeV2Ray] Core controller created")
            } catch (e: Exception) {
                Log.e(TAG, "[initializeV2Ray] Core controller creation failed: ${e.message}", e)
                return false
            }

            isInitialized = true
            Log.d(TAG, "[initializeV2Ray] ✅ Initialization completed successfully")
            return true
            
        } catch (e: Exception) {
            Log.e(TAG, "[initializeV2Ray] ❌ Critical failure: ${e.message}", e)
            isInitialized = false
            return false
        }
    }

    // --- Safe Start/Stop/Status Methods ---

    fun startV2Ray(config: String): Boolean {
        Log.d(TAG, "[startV2Ray] Starting V2Ray")
        
        if (!isInitialized) {
            Log.e(TAG, "[startV2Ray] Not initialized!")
            return false
        }
        
        if (isRunning()) {
            Log.w(TAG, "[startV2Ray] Already running, stopping first")
            stopV2Ray()
            Thread.sleep(500) // Give it time to stop
        }

        return try {
            Log.d(TAG, "[startV2Ray] Config size: ${config.length} chars")
            currentConfig = config

            // VPN mode logging
            if (vpnMode) {
                Log.d(TAG, "[startV2Ray] Running in VPN mode - traffic will be routed through proxy")
            } else {
                Log.d(TAG, "[startV2Ray] Running in local proxy mode")
            }

            coreController?.startLoop(config)
            
            // Verify it actually started
            Thread.sleep(1000)
            val running = coreController?.isRunning ?: false
            if (running) {
                Log.d(TAG, "[startV2Ray] ✅ Started successfully")
                true
            } else {
                Log.e(TAG, "[startV2Ray] ❌ Start failed - not running")
                currentConfig = null
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "[startV2Ray] ❌ Exception: ${e.message}", e)
            currentConfig = null
            false
        }
    }

    fun stopV2Ray(): Boolean {
        Log.d(TAG, "[stopV2Ray] Stopping V2Ray")
        
        if (!isInitialized) {
            Log.w(TAG, "[stopV2Ray] Not initialized")
            return true
        }
        
        return try {
            coreController?.stopLoop()
            currentConfig = null
            vpnMode = false // Reset VPN mode
            
            // Verify it actually stopped
            Thread.sleep(500)
            val running = coreController?.isRunning ?: false
            if (!running) {
                Log.d(TAG, "[stopV2Ray] ✅ Stopped successfully")
                true
            } else {
                Log.w(TAG, "[stopV2Ray] ⚠️ May not have stopped completely")
                true // Still return true as we tried
            }
        } catch (e: Exception) {
            Log.e(TAG, "[stopV2Ray] ❌ Exception: ${e.message}", e)
            currentConfig = null
            vpnMode = false
            true // Return true to avoid blocking further operations
        }
    }

    fun isRunning(): Boolean {
        return try {
            val running = coreController?.isRunning ?: false
            Log.d(TAG, "[isRunning] Status: $running")
            running
        } catch (e: Exception) {
            Log.e(TAG, "[isRunning] Error: ${e.message}", e)
            false
        }
    }

    fun getVersion(): String {
        return try {
            val version = Libv2ray.checkVersionX()
            Log.d(TAG, "[getVersion] $version")
            version
        } catch (e: Exception) {
            Log.e(TAG, "[getVersion] Error: ${e.message}", e)
            "Unknown"
        }
    }

    // --- Enhanced VMess parsing with error handling ---

    fun isValidVmessLink(vmessLink: String): Boolean {
        Log.d(TAG, "[isValidVmessLink] Validating link...")
        
        val valid = try {
            when {
                vmessLink.startsWith("vmess://") -> parseVmessLink(vmessLink) != null
                else -> false
            }
        } catch (e: Exception) {
            Log.e(TAG, "[isValidVmessLink] Validation error: ${e.message}", e)
            false
        }
        
        Log.d(TAG, "[isValidVmessLink] Result: $valid")
        return valid
    }

    fun parseVmessLink(vmessLink: String): String? {
        Log.d(TAG, "[parseVmessLink] Parsing VMess link")
        
        return try {
            if (!vmessLink.startsWith("vmess://")) {
                Log.e(TAG, "[parseVmessLink] Invalid VMess format")
                return null
            }
            
            val base64Config = vmessLink.substring(8)
            val configJson = String(Base64.decode(base64Config, Base64.DEFAULT))
            val vmessConfig = JSONObject(configJson)
            
            // Validate required fields
            val address = vmessConfig.getString("add")
            if (address.isBlank()) {
                Log.e(TAG, "[parseVmessLink] Invalid server address")
                return null
            }
            
            val port = vmessConfig.getInt("port")
            if (port <= 0 || port > 65535) {
                Log.e(TAG, "[parseVmessLink] Invalid port: $port")
                return null
            }
            
            val id = vmessConfig.getString("id")
            if (id.isBlank()) {
                Log.e(TAG, "[parseVmessLink] Invalid user ID")
                return null
            }
            
            val aid = vmessConfig.optInt("aid", 0)
            val security = vmessConfig.optString("scy", "auto")
            val network = vmessConfig.optString("net", "tcp")
            val type = vmessConfig.optString("type", "none")
            val host = vmessConfig.optString("host", "")
            val path = vmessConfig.optString("path", "/")
            val tls = vmessConfig.optString("tls", "")
            val remarks = vmessConfig.optString("ps", "V2Ray Server")

            Log.d(TAG, "[parseVmessLink] Server: $address:$port, Network: $network, TLS: $tls")

            val config = generateSimpleV2RayConfig(address, port, id, aid, security, network, type, host, path, tls, remarks)
            
            Log.d(TAG, "[parseVmessLink] ✅ Config generated successfully")
            config
        } catch (e: Exception) {
            Log.e(TAG, "[parseVmessLink] ❌ Error: ${e.message}", e)
            null
        }
    }

    // --- Simplified, Panic-Resistant Config Generation ---

    private fun generateSimpleV2RayConfig(
        address: String,
        port: Int,
        id: String,
        aid: Int,
        security: String,
        network: String,
        type: String,
        host: String,
        path: String,
        tls: String,
        remarks: String
    ): String {
        Log.d(TAG, "[generateSimpleV2RayConfig] Creating Android VPN-compatible config")
        
        // Validate input parameters
        if (address.isBlank() || port <= 0 || port > 65535 || id.isBlank()) {
            throw IllegalArgumentException("Invalid server configuration: address=$address, port=$port, id=$id")
        }
        
        try {
            val config = JSONObject().apply {
                // Minimal logging to reduce overhead
                put("log", JSONObject().apply {
                    put("loglevel", "warning")
                })
                
                // Android VPN service compatible inbounds
                put("inbounds", org.json.JSONArray().apply {
                    // PRIMARY: SOCKS proxy for TUN2SOCKS bridge (v2rayNG style)
                    put(JSONObject().apply {
                        put("tag", "socks-in")
                        put("port", 10808)
                        put("listen", "127.0.0.1")
                        put("protocol", "socks")
                        put("settings", JSONObject().apply {
                            put("auth", "noauth")
                            put("udp", true)
                            put("ip", "127.0.0.1")
                        })
                        put("sniffing", JSONObject().apply {
                            put("enabled", true)
                            put("destOverride", org.json.JSONArray().apply {
                                put("http")
                                put("tls")
                                put("fakedns")
                            })
                        })
                    })
                    
                    // HTTP proxy for VPN traffic routing
                    put(JSONObject().apply {
                        put("tag", "http-in")
                        put("port", 10809)
                        put("listen", "127.0.0.1")
                        put("protocol", "http")
                        put("settings", JSONObject().apply {
                            put("allowTransparent", true)
                        })
                    })
                    
                    // DNS redirect for TUN interface
                    put(JSONObject().apply {
                        put("tag", "dns-redirect")
                        put("port", 5353)
                        put("listen", "127.0.0.1")
                        put("protocol", "dokodemo-door")
                        put("settings", JSONObject().apply {
                            put("address", "1.1.1.1")
                            put("port", 53)
                            put("network", "tcp,udp")
                        })
                    })
                })
                
                // VPN-optimized outbounds
                put("outbounds", org.json.JSONArray().apply {
                    // Main proxy outbound
                    put(JSONObject().apply {
                        put("tag", "proxy")
                        put("protocol", "vmess")
                        put("settings", JSONObject().apply {
                            put("vnext", org.json.JSONArray().put(JSONObject().apply {
                                put("address", address)
                                put("port", port)
                                put("users", org.json.JSONArray().put(JSONObject().apply {
                                    put("id", id)
                                    put("alterId", aid)
                                    put("security", if (security == "auto") "aes-128-gcm" else security)
                                    put("level", 0)
                                }))
                            }))
                        })
                        
                        // VPN-optimized stream settings
                        put("streamSettings", JSONObject().apply {
                            put("network", network)
                            put("security", if (tls.isNotEmpty() && tls != "none") "tls" else "none")
                            
                            if (network == "tcp") {
                                put("tcpSettings", JSONObject().apply {
                                    put("header", JSONObject().apply {
                                        put("type", type)
                                    })
                                })
                            } else if (network == "ws") {
                                put("wsSettings", JSONObject().apply {
                                    put("path", path)
                                    if (host.isNotEmpty()) {
                                        put("headers", JSONObject().apply {
                                            put("Host", host)
                                        })
                                    }
                                })
                            }
                            
                            if (tls == "tls") {
                                put("tlsSettings", JSONObject().apply {
                                    put("allowInsecure", true)
                                    if (host.isNotEmpty()) {
                                        put("serverName", host)
                                    }
                                })
                            }
                            
                            // VPN-specific socket options
                            put("sockopt", JSONObject().apply {
                                put("mark", 255) // Avoid routing loops
                            })
                        })
                        
                        // Enable multiplexing for better VPN performance
                        put("mux", JSONObject().apply {
                            put("enabled", true)
                            put("concurrency", 8)
                        })
                    })
                    
                    // Direct outbound for local traffic
                    put(JSONObject().apply {
                        put("tag", "direct")
                        put("protocol", "freedom")
                        put("settings", JSONObject().apply {
                            put("domainStrategy", "UseIPv4")
                        })
                        put("streamSettings", JSONObject().apply {
                            put("sockopt", JSONObject().apply {
                                put("mark", 255) // Avoid routing loops
                            })
                        })
                    })
                    
                    // Block outbound for unwanted traffic
                    put(JSONObject().apply {
                        put("tag", "block")
                        put("protocol", "blackhole")
                        put("settings", JSONObject().apply {
                            put("response", JSONObject().apply {
                                put("type", "http")
                            })
                        })
                    })
                })
                
                // VPN-optimized routing with proper DNS handling
                put("routing", JSONObject().apply {
                    put("domainStrategy", "IPIfNonMatch")
                    put("rules", org.json.JSONArray().apply {
                        // DNS queries from VPN interface - route through proxy
                        put(JSONObject().apply {
                            put("type", "field")
                            put("inboundTag", org.json.JSONArray().put("dns-redirect"))
                            put("outboundTag", "proxy")
                        })
                        
                        // Block ads and trackers (faster response)
                        put(JSONObject().apply {
                            put("type", "field")
                            put("outboundTag", "block")
                            put("domain", org.json.JSONArray().apply {
                                put("regexp:.*\\.doubleclick\\.net")
                                put("regexp:.*\\.googleadservices\\.com")
                                put("regexp:.*\\.googlesyndication\\.com")
                                put("regexp:.*\\.google-analytics\\.com")
                                put("regexp:.*\\.googletagmanager\\.com")
                                put("regexp:.*\\.facebook\\.com/tr")
                                put("regexp:.*ads\\.")
                            })
                        })
                        
                        // CRITICAL: Bypass proxy server to avoid routing loops
                        // Handle both hostnames and IP addresses properly
                        put(JSONObject().apply {
                            put("type", "field")
                            put("outboundTag", "direct")
                            
                            // Try to resolve hostname to IP, fallback to domain rule if needed
                            try {
                                val serverAddr = java.net.InetAddress.getByName(address)
                                // If it resolves to an IP, use IP rule
                                put("ip", org.json.JSONArray().put(serverAddr.hostAddress))
                            } catch (e: Exception) {
                                // If resolution fails, use domain rule instead
                                Log.w(TAG, "[generateSimpleV2RayConfig] Could not resolve server IP, using domain rule: ${e.message}")
                                put("domain", org.json.JSONArray().put(address))
                            }
                        })
                        
                        // Local/private networks go direct (avoid VPN routing)
                        put(JSONObject().apply {
                            put("type", "field")
                            put("outboundTag", "direct")
                            put("ip", org.json.JSONArray().apply {
                                put("127.0.0.0/8")
                                put("10.0.0.0/8")
                                put("172.16.0.0/12")
                                put("192.168.0.0/16")
                                put("169.254.0.0/16")
                                put("224.0.0.0/4")
                                put("255.255.255.255/32")
                            })
                        })
                        
                        // CRITICAL: All traffic from SOCKS proxy goes through V2Ray proxy (v2rayNG style)
                        put(JSONObject().apply {
                            put("type", "field")
                            put("inboundTag", org.json.JSONArray().put("socks-in"))
                            put("outboundTag", "proxy")
                        })
                        
                        // Traffic from HTTP proxy
                        put(JSONObject().apply {
                            put("type", "field")
                            put("inboundTag", org.json.JSONArray().put("http-in"))
                            put("outboundTag", "proxy")
                        })
                        
                        // DNS redirect traffic
                        put(JSONObject().apply {
                            put("type", "field")
                            put("inboundTag", org.json.JSONArray().put("dns-redirect"))
                            put("outboundTag", "proxy")
                        })
                        
                        // Default: everything else goes through proxy
                        put(JSONObject().apply {
                            put("type", "field")
                            put("outboundTag", "proxy")
                            put("network", "tcp,udp")
                        })
                    })
                })
                
                // Simplified DNS configuration for VPN compatibility
                put("dns", JSONObject().apply {
                    put("servers", org.json.JSONArray().apply {
                        // Primary Cloudflare DNS
                        put(JSONObject().apply {
                            put("address", "1.1.1.1")
                            put("port", 53)
                        })
                        
                        // Secondary Cloudflare DNS
                        put(JSONObject().apply {
                            put("address", "1.0.0.1")
                            put("port", 53)
                        })
                        
                        // Google DNS fallback
                        put(JSONObject().apply {
                            put("address", "8.8.8.8")
                            put("port", 53)
                        })
                        
                        // Google DNS secondary
                        put(JSONObject().apply {
                            put("address", "8.8.4.4")
                            put("port", 53)
                        })
                    })
                    put("queryStrategy", "UseIPv4")
                    put("disableCache", false)
                    put("tag", "dns_inbound")
                    // CRITICAL: Remove any geosite rules that might cause errors
                    // Keep DNS configuration simple for Android VPN compatibility
                })
            }
            
            val result = config.toString(2)
            Log.d(TAG, "[generateSimpleV2RayConfig] Generated Android VPN config (${result.length} chars)")
            return result
        } catch (e: Exception) {
            Log.e(TAG, "[generateSimpleV2RayConfig] ❌ Error: ${e.message}", e)
            throw RuntimeException("Config generation failed", e)
        }
    }

    // --- Safe Status/Stats Methods ---

    fun getCurrentConfig(): String? = currentConfig

    fun measureDelay(serverUrl: String): Long {
        return try {
            val result = coreController?.measureDelay(serverUrl) ?: -1
            Log.d(TAG, "[measureDelay] $serverUrl: ${result}ms")
            result
        } catch (e: Exception) {
            Log.e(TAG, "[measureDelay] Error: ${e.message}", e)
            -1
        }
    }

    fun queryStats(name: String, reset: Boolean = false): Long {
        return try {
            val result = coreController?.queryStats(name, reset.toString()) ?: 0
            result
        } catch (e: Exception) {
            Log.e(TAG, "[queryStats] Error: ${e.message}", e)
            0
        }
    }
}
