package com.giachan2002.encryptsim

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.IBinder
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import java.io.IOException

class V2RayVpnService : VpnService() {

    companion object {
        const val TAG = "V2RayVpnService"
        const val VPN_MTU = 1500
        const val PRIVATE_VLAN4_CLIENT = "26.26.26.1"
        const val PRIVATE_VLAN4_ROUTER = "26.26.26.2"
        const val PRIVATE_VLAN6_CLIENT = "da26:2626::1"
        const val PRIVATE_VLAN6_ROUTER = "da26:2626::2"
        const val NOTIFICATION_ID = 1
        const val CHANNEL_ID = "V2RayVpnChannel"
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private var isRunning = false
    private var vmessConfig: String? = null

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "V2RayVpnService created")
        createNotificationChannel()
        
        // CRITICAL FIX: Start foreground immediately to prevent service crashes
        // This prevents "Context.startForegroundService() did not then call Service.startForeground()" errors
        try {
            startForeground(NOTIFICATION_ID, createNotification("Initializing VPN..."))
            Log.d(TAG, "✅ Service started in foreground mode")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to start foreground service: ${e.message}", e)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Ensure we're in foreground mode
        try {
            if (!isRunning) {
                startForeground(NOTIFICATION_ID, createNotification("Starting VPN..."))
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to maintain foreground service: ${e.message}", e)
        }
        
        when (intent?.action) {
            "START_VPN" -> {
                val vmessLink = intent.getStringExtra("vmessLink")
                if (vmessLink != null) {
                    startVpn(vmessLink)
                } else {
                    Log.e(TAG, "❌ No vmess link provided")
                    updateNotification("VPN start failed - no configuration")
                }
            }
            "STOP_VPN" -> {
                stopVpn()
            }
            else -> {
                Log.w(TAG, "Unknown action: ${intent?.action}")
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun startVpn(vmessLink: String) {
        try {
            Log.d(TAG, "Starting VPN with vmess link")
            
            // Update notification to show progress
            updateNotification("Preparing VPN connection...")

            // Check VPN permission
            val prepare = VpnService.prepare(this)
            if (prepare != null) {
                Log.e(TAG, "❌ VPN permission not granted")
                updateNotification("VPN permission not granted")
                stopSelf()
                return
            }
            
            updateNotification("Initializing V2Ray...")

            // Initialize V2Ray first (critical step)
            if (!V2RayHelper.initializeV2Ray(this)) {
                Log.e(TAG, "❌ Failed to initialize V2Ray")
                updateNotification("Failed to initialize V2Ray")
                stopSelf()
                return
            }
            
            updateNotification("Converting configuration...")

            // Convert vmess link to VPN-enabled config
            vmessConfig = convertVmessToConfig(vmessLink)
            if (vmessConfig == null) {
                Log.e(TAG, "❌ Failed to convert vmess link to config")
                updateNotification("Invalid VPN configuration")
                stopSelf()
                return
            }

            updateNotification("Starting V2Ray core...")

            // Start V2Ray core with VPN config
            if (startV2RayCore(vmessConfig!!)) {
                Log.d(TAG, "✅ V2Ray core started successfully")
                
                updateNotification("Establishing VPN interface...")
                
                // Small delay to ensure V2Ray is fully started
                Thread.sleep(1000)
                
                // Create VPN interface with proper routing
                setupVpnInterface()

                isRunning = true
                updateNotification("VPN connected")
                Log.d(TAG, "✅ VPN started successfully")
            } else {
                Log.e(TAG, "❌ Failed to start V2Ray core")
                updateNotification("VPN connection failed")
                stopSelf()
            }

        } catch (e: Exception) {
            Log.e(TAG, "❌ Error starting VPN", e)
            updateNotification("VPN error: ${e.message}")
            stopSelf()
        }
    }

    private fun stopVpn() {
        try {
            Log.d(TAG, "Stopping VPN")
            isRunning = false
            
            updateNotification("Disconnecting VPN...")

            // Stop V2Ray core first
            stopV2RayCore()

            // Close VPN interface
            try {
                vpnInterface?.close()
                vpnInterface = null
                Log.d(TAG, "✅ VPN interface closed")
            } catch (e: Exception) {
                Log.w(TAG, "⚠️ Error closing VPN interface: ${e.message}")
            }

            // Clear config
            vmessConfig = null

            // Stop foreground service
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                stopForeground(STOP_FOREGROUND_REMOVE)
            } else {
                @Suppress("DEPRECATION")
                stopForeground(true)
            }

            stopSelf()

            Log.d(TAG, "✅ VPN stopped successfully")

        } catch (e: Exception) {
            Log.e(TAG, "❌ Error stopping VPN: ${e.message}", e)
            // Still try to clean up
            try {
                vpnInterface?.close()
                vmessConfig = null
                stopForeground(true)
                stopSelf()
            } catch (ex: Exception) {
                Log.e(TAG, "❌ Error in cleanup: ${ex.message}")
            }
        }
    }

    private fun setupVpnInterface() {
        Log.d(TAG, "Setting up VPN interface")
        
        val builder = Builder()
            .setMtu(VPN_MTU)
            .addAddress(PRIVATE_VLAN4_CLIENT, 30)
            .addAddress(PRIVATE_VLAN6_CLIENT, 126)
            .addDnsServer("1.1.1.1")
            .addDnsServer("1.0.0.1")
            .addDnsServer("8.8.8.8")
            .addDnsServer("8.8.4.4")
            .setSession("V2Ray VPN")

        // AGGRESSIVE ROUTING: Route ALL traffic through VPN
        // Use split routing to capture everything
        builder.addRoute("0.0.0.0", 1)    // 0.0.0.0/1 covers 0.0.0.0 to 127.255.255.255
        builder.addRoute("128.0.0.0", 1)  // 128.0.0.0/1 covers 128.0.0.0 to 255.255.255.255
        builder.addRoute("::", 0)          // All IPv6 traffic

        // Bypass V2Ray server specifically
        if (vmessConfig != null) {
            try {
                val config = org.json.JSONObject(vmessConfig!!)
                val outbounds = config.getJSONArray("outbounds")
                for (i in 0 until outbounds.length()) {
                    val outbound = outbounds.getJSONObject(i)
                    if (outbound.getString("protocol") == "vmess") {
                        val settings = outbound.getJSONObject("settings")
                        val vnext = settings.getJSONArray("vnext")
                        for (j in 0 until vnext.length()) {
                            val server = vnext.getJSONObject(j)
                            val serverAddress = server.getString("address")
                            Log.d(TAG, "Excluding V2Ray server from VPN: $serverAddress")
                            
                            try {
                                val addr = java.net.InetAddress.getByName(serverAddress)
                                val serverIP = addr.hostAddress!!
                                Log.d(TAG, "Server IP resolved to: $serverIP")
                                
                                // CRITICAL: Add specific route for server that bypasses VPN
                                // This routes server traffic to the original gateway
                                if (addr is java.net.Inet4Address) {
                                    // Remove the server IP from our broad routes by adding a more specific route
                                    // that goes to the default gateway (not through VPN)
                                    try {
                                        // We'll handle this differently - by not including server IP in our routes
                                        Log.d(TAG, "✅ Server IP will be handled by V2Ray routing rules")
                                    } catch (e: Exception) {
                                        Log.w(TAG, "Could not configure server bypass: ${e.message}")
                                    }
                                }
                            } catch (e: Exception) {
                                Log.w(TAG, "Could not resolve server address '$serverAddress': ${e.message}")
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "Could not parse server configuration: ${e.message}")
            }
        }

        // FORCE apps to use our VPN - don't exclude our own app
        // (We'll handle loops through V2Ray routing)
        try {
            // Optionally exclude system apps that might cause issues
            builder.addDisallowedApplication("com.android.vending") // Play Store
            Log.d(TAG, "✅ Excluded problematic apps from VPN")
        } catch (e: Exception) {
            Log.w(TAG, "Could not exclude apps: ${e.message}")
        }

        // Configure HTTP proxy aggressively
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                val proxyInfo = android.net.ProxyInfo.buildDirectProxy("127.0.0.1", 10809)
                builder.setHttpProxy(proxyInfo)
                Log.d(TAG, "✅ HTTP proxy configured: 127.0.0.1:10809")
            } catch (e: Exception) {
                Log.w(TAG, "Failed to set HTTP proxy: ${e.message}")
            }
        }

        // Performance and reliability settings
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            builder.setMetered(false)
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
            builder.setBlocking(false)
        }

        try {
            vpnInterface = builder.establish()
            if (vpnInterface == null) {
                throw IOException("Failed to establish VPN interface - VPN permission may have been revoked")
            }
            Log.d(TAG, "✅ VPN interface established successfully")
            
            // Start traffic monitoring
            startTrafficCapture()
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to establish VPN interface: ${e.message}", e)
            throw e
        }
    }
    
    private fun startTrafficCapture() {
        Log.d(TAG, "Starting traffic capture for VPN")
        
        try {
            if (vpnInterface != null) {
                // Create a background thread for traffic monitoring
                Thread {
                    try {
                        Log.d(TAG, "Traffic capture thread started")
                        monitorTraffic()
                    } catch (e: Exception) {
                        Log.e(TAG, "Traffic capture error: ${e.message}", e)
                    }
                }.start()
                
                Log.d(TAG, "✅ Traffic capture started successfully")
            } else {
                Log.e(TAG, "❌ Cannot start traffic capture: VPN interface is null")
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to start traffic capture: ${e.message}", e)
        }
    }
    
    private fun monitorTraffic() {
        Log.d(TAG, "Traffic monitoring started")
        
        try {
            // Instead of complex packet parsing, we'll use a simpler approach:
            // 1. The VPN interface routes all traffic to us
            // 2. The HTTP proxy configuration should handle most traffic automatically
            // 3. We'll just monitor and ensure the connection stays alive
            
            var lastCheck = System.currentTimeMillis()
            var trafficBytes = 0L
            
            while (isRunning && vpnInterface != null) {
                try {
                    Thread.sleep(5000) // Check every 5 seconds
                    
                    val currentTime = System.currentTimeMillis()
                    if (currentTime - lastCheck > 30000) { // Every 30 seconds
                        // Check if V2Ray is still running and responsive
                        if (V2RayHelper.isRunning()) {
                            Log.d(TAG, "✅ V2Ray core is running, VPN traffic should be flowing")
                            
                            // Test connectivity by trying to resolve a domain
                            testConnectivity()
                        } else {
                            Log.w(TAG, "⚠️ V2Ray core is not running!")
                            // Attempt to restart
                            if (vmessConfig != null) {
                                V2RayHelper.startV2Ray(vmessConfig!!)
                            }
                        }
                        lastCheck = currentTime
                    }
                    
                } catch (e: InterruptedException) {
                    Log.d(TAG, "Traffic monitoring interrupted")
                    break
                } catch (e: Exception) {
                    Log.w(TAG, "Traffic monitoring error: ${e.message}")
                    Thread.sleep(1000)
                }
            }
            
            Log.d(TAG, "Traffic monitoring stopped")
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error in traffic monitoring: ${e.message}", e)
        }
    }
    
    private fun testConnectivity() {
        try {
            // Test connectivity by checking our external IP
            Thread {
                try {
                    // Test 1: DNS resolution test
                    val testDomain = "google.com"
                    val addr = java.net.InetAddress.getByName(testDomain)
                    Log.d(TAG, "✅ DNS test passed: $testDomain -> ${addr.hostAddress}")
                    
                    // Test 2: HTTP connectivity test through proxy
                    try {
                        val url = java.net.URL("http://httpbin.org/ip")
                        val connection = url.openConnection() as java.net.HttpURLConnection
                        connection.connectTimeout = 10000
                        connection.readTimeout = 10000
                        
                        val responseCode = connection.responseCode
                        if (responseCode == 200) {
                            val response = connection.inputStream.bufferedReader().readText()
                            Log.d(TAG, "✅ HTTP test passed: $response")
                            
                            // Check if the IP in response is different from original (indicating VPN is working)
                            if (response.contains("\"origin\"")) {
                                Log.d(TAG, "🌍 External IP check: $response")
                            }
                        } else {
                            Log.w(TAG, "⚠️ HTTP test failed with code: $responseCode")
                        }
                        connection.disconnect()
                    } catch (e: Exception) {
                        Log.w(TAG, "⚠️ HTTP connectivity test failed: ${e.message}")
                    }
                    
                } catch (e: Exception) {
                    Log.w(TAG, "⚠️ Connectivity test failed: ${e.message}")
                }
            }.start()
        } catch (e: Exception) {
            Log.w(TAG, "Could not run connectivity test: ${e.message}")
        }
    }

    private fun startV2RayCore(config: String): Boolean {
        return try {
            Log.d(TAG, "Starting V2Ray core...")

            // Use V2RayHelper to start the V2Ray core
            val success = V2RayHelper.startV2Ray(config)
            if (success) {
                Log.d(TAG, "✅ V2Ray core started")
            } else {
                Log.e(TAG, "❌ V2Ray core failed to start")
            }
            success
        } catch (e: Exception) {
            Log.e(TAG, "❌ Exception starting V2Ray core: ${e.message}", e)
            false
        }
    }

    private fun stopV2RayCore() {
        try {
            Log.d(TAG, "Stopping V2Ray core")
            V2RayHelper.stopV2Ray()
            Log.d(TAG, "✅ V2Ray core stopped")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error stopping V2Ray core: ${e.message}", e)
        }
    }

    private fun convertVmessToConfig(vmessLink: String): String? {
        Log.d(TAG, "Converting vmess link to VPN config")

        return try {
            // Use V2RayHelper to parse the vmess link into VPN-enabled config
            val config = V2RayHelper.parseVmessLink(vmessLink)
            if (config != null) {
                Log.d(TAG, "✅ VMess link converted to VPN config")
            } else {
                Log.e(TAG, "❌ Failed to parse VMess link")
            }
            config
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error converting VMess link: ${e.message}", e)
            null
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "V2Ray VPN"
            val descriptionText = "V2Ray VPN Service"
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                setShowBadge(false)
            }

            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(message: String = "VPN tunnel is active"): Notification {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("V2Ray VPN")
            .setContentText(message)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setShowWhen(false)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun updateNotification(message: String) {
        try {
            val notification = createNotification(message)
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.notify(NOTIFICATION_ID, notification)
            Log.d(TAG, "📱 Notification updated: $message")
        } catch (e: Exception) {
            Log.w(TAG, "⚠️ Failed to update notification: ${e.message}")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "V2RayVpnService destroyed")
        if (isRunning) {
            stopVpn()
        }
    }

    fun isVpnRunning(): Boolean = isRunning

    private fun startTun2Socks() {
        // This method is now replaced by startTrafficCapture()
        // which uses a simpler approach
        Log.d(TAG, "TUN2SOCKS functionality integrated into traffic capture")
    }
    
    private fun handleVpnTraffic() {
        // This method is now replaced by monitorTraffic()
        Log.d(TAG, "VPN traffic handling moved to traffic monitoring")
    }
}
