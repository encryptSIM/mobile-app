package com.giachan2002.encryptsim

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import java.io.File

@ReactModule(name = V2RayModule.NAME)
class V2RayModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "V2RayModule"
        private const val TAG = "V2RayModule"
        private const val BASEKEY_FILENAME = "basekey"
    }

    private var isInitialized = false

    private fun ensureInitialized(): Boolean {
        if (!isInitialized) {
            isInitialized = V2RayHelper.initializeV2Ray(reactApplicationContext)
            if (!isInitialized) {
                Log.e(TAG, "Failed to initialize V2Ray environment")
            }
        }
        return isInitialized
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun setBasekey(basekeyString: String, promise: Promise) {
        try {
            val basekeyBytes: ByteArray =
                if (basekeyString.length == 64 && basekeyString.matches(Regex("[0-9a-fA-F]+"))) {
                    // Interpret as hex string
                    basekeyString.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
                } else {
                    // Try to interpret as base64
                    android.util.Base64.decode(basekeyString, android.util.Base64.DEFAULT)
                }

            if (basekeyBytes.size != 32) {
                promise.reject("INVALID_BASEKEY", "basekey must be 32 bytes after decoding. Got ${basekeyBytes.size} bytes.")
                return
            }
            val file = File(reactApplicationContext.filesDir, BASEKEY_FILENAME)
            file.writeBytes(basekeyBytes)
            promise.resolve("Basekey written successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error writing basekey", e)
            promise.reject("BASEKEY_WRITE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startVpnService(vmessLink: String, promise: Promise) {
        try {
            Log.d(TAG, "startVpnService called with: $vmessLink")
            if (!ensureInitialized()) {
                promise.reject("INIT_FAILED", "Failed to initialize V2Ray environment")
                return
            }
            if (!V2RayHelper.isValidVmessLink(vmessLink)) {
                promise.reject("INVALID_VMESS_LINK", "Invalid vmess link format")
                return
            }
            val intent = android.content.Intent(reactApplicationContext, V2RayVpnService::class.java).apply {
                action = "START_VPN"
                putExtra("vmessLink", vmessLink)
            }
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(intent)
            } else {
                reactApplicationContext.startService(intent)
            }
            promise.resolve("VPN service started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting VPN service", e)
            promise.reject("VPN_START_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopVpnService(promise: Promise) {
        try {
            Log.d(TAG, "stopVpnService called")
            val intent = android.content.Intent(reactApplicationContext, V2RayVpnService::class.java).apply {
                action = "STOP_VPN"
            }
            reactApplicationContext.startService(intent)
            promise.resolve("VPN service stopped successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping VPN service", e)
            promise.reject("VPN_STOP_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startWithVmessLink(vmessLink: String, promise: Promise) {
        try {
            Log.d(TAG, "startWithVmessLink called with: $vmessLink")
            if (!ensureInitialized()) {
                promise.reject("INIT_FAILED", "Failed to initialize V2Ray environment")
                return
            }
            if (!V2RayHelper.isValidVmessLink(vmessLink)) {
                promise.reject("INVALID_VMESS_LINK", "Invalid vmess link format")
                return
            }
            val config = V2RayHelper.parseVmessLink(vmessLink)
            if (config == null) {
                promise.reject("PARSE_ERROR", "Failed to parse vmess link")
                return
            }
            if (V2RayHelper.startV2Ray(config)) {
                promise.resolve("V2Ray started successfully")
            } else {
                promise.reject("START_FAILED", "Failed to start V2Ray")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in startWithVmessLink", e)
            promise.reject("INIT_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun startLoop(configJson: String, promise: Promise) {
        try {
            Log.d(TAG, "startLoop called with config")
            if (!ensureInitialized()) {
                promise.reject("INIT_FAILED", "Failed to initialize V2Ray environment")
                return
            }
            if (configJson.isBlank()) {
                promise.reject("INVALID_CONFIG", "Configuration cannot be empty")
                return
            }
            if (V2RayHelper.startV2Ray(configJson)) {
                promise.resolve("V2Ray started with custom config")
            } else {
                promise.reject("START_FAILED", "Failed to start V2Ray with provided config")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in startLoop", e)
            promise.reject("START_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            Log.d(TAG, "stop called")
            if (!isInitialized) {
                promise.resolve("V2Ray was not initialized")
                return
            }
            if (V2RayHelper.stopV2Ray()) {
                promise.resolve("V2Ray stopped successfully")
            } else {
                promise.reject("STOP_FAILED", "Failed to stop V2Ray")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping V2Ray", e)
            promise.reject("STOP_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun checkVersion(promise: Promise) {
        try {
            Log.d(TAG, "checkVersion called")
            if (!ensureInitialized()) {
                promise.reject("INIT_FAILED", "Failed to initialize V2Ray environment")
                return
            }
            val version = V2RayHelper.getVersion()
            promise.resolve(version)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting version", e)
            promise.reject("VERSION_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        try {
            val status = if (V2RayHelper.isRunning()) "running" else "stopped"
            val result = WritableNativeMap().apply {
                putString("status", status)
                putString("config", V2RayHelper.getCurrentConfig())
            }
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting status", e)
            promise.reject("STATUS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun parseVmessLink(vmessLink: String, promise: Promise) {
        try {
            Log.d(TAG, "parseVmessLink called")
            if (!ensureInitialized()) {
                promise.reject("INIT_FAILED", "Failed to initialize V2Ray environment")
                return
            }
            if (!V2RayHelper.isValidVmessLink(vmessLink)) {
                promise.reject("INVALID_VMESS_LINK", "Invalid vmess link format")
                return
            }
            val config = V2RayHelper.parseVmessLink(vmessLink)
            if (config != null) {
                promise.resolve(config)
            } else {
                promise.reject("PARSE_ERROR", "Failed to parse vmess link")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing vmess link", e)
            promise.reject("PARSE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun validateVmessLink(vmessLink: String, promise: Promise) {
        try {
            if (!ensureInitialized()) {
                promise.reject("INIT_FAILED", "Failed to initialize V2Ray environment")
                return
            }
            val isValid = V2RayHelper.isValidVmessLink(vmessLink)
            promise.resolve(isValid)
        } catch (e: Exception) {
            Log.e(TAG, "Error validating vmess link", e)
            promise.reject("VALIDATION_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun measureDelay(serverUrl: String, promise: Promise) {
        try {
            Log.d(TAG, "measureDelay called for: $serverUrl")
            if (!ensureInitialized()) {
                promise.reject("INIT_FAILED", "Failed to initialize V2Ray environment")
                return
            }
            val delay = V2RayHelper.measureDelay(serverUrl)
            if (delay >= 0) {
                promise.resolve(delay.toDouble())
            } else {
                promise.reject("MEASURE_FAILED", "Failed to measure delay")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error measuring delay", e)
            promise.reject("MEASURE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getUploadStats(promise: Promise) {
        try {
            val uploadStats = V2RayHelper.queryStats("user>>>proxy>>>traffic>>>uplink", false)
            promise.resolve(uploadStats.toDouble())
        } catch (e: Exception) {
            Log.e(TAG, "Error getting upload stats", e)
            promise.reject("STATS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getDownloadStats(promise: Promise) {
        try {
            val downloadStats = V2RayHelper.queryStats("user>>>proxy>>>traffic>>>downlink", false)
            promise.resolve(downloadStats.toDouble())
        } catch (e: Exception) {
            Log.e(TAG, "Error getting download stats", e)
            promise.reject("STATS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getAllStats(promise: Promise) {
        try {
            val uploadStats = V2RayHelper.queryStats("user>>>proxy>>>traffic>>>uplink", false)
            val downloadStats = V2RayHelper.queryStats("user>>>proxy>>>traffic>>>downlink", false)
            val result = WritableNativeMap().apply {
                putDouble("upload", uploadStats.toDouble())
                putDouble("download", downloadStats.toDouble())
                putDouble("total", (uploadStats + downloadStats).toDouble())
            }
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting all stats", e)
            promise.reject("STATS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun resetStats(promise: Promise) {
        try {
            if (!ensureInitialized()) {
                promise.reject("INIT_FAILED", "Failed to initialize V2Ray environment")
                return
            }
            V2RayHelper.queryStats("user>>>proxy>>>traffic>>>uplink", true)
            V2RayHelper.queryStats("user>>>proxy>>>traffic>>>downlink", true)
            promise.resolve("Stats reset successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error resetting stats", e)
            promise.reject("RESET_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun testLibraryAccess(promise: Promise) {
        try {
            Log.d(TAG, "Testing V2Ray library access")
            val version = libv2ray.Libv2ray.checkVersionX()
            Log.d(TAG, "Library access successful, version: $version")
            val result = WritableNativeMap().apply {
                putBoolean("libraryAccessible", true)
                putString("version", version)
                putString("status", "V2Ray library accessible")
            }
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error accessing V2Ray library", e)
            promise.reject("LIBRARY_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun testInitialization(promise: Promise) {
        try {
            Log.d(TAG, "Testing V2Ray initialization")
            if (ensureInitialized()) {
                val version = V2RayHelper.getVersion()
                val result = WritableNativeMap().apply {
                    putBoolean("initialized", true)
                    putString("version", version)
                    putString("status", "V2Ray initialization successful")
                }
                promise.resolve(result)
            } else {
                promise.reject("INIT_FAILED", "V2Ray initialization failed")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error testing initialization", e)
            promise.reject("TEST_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getBaseKeyFilePath(promise: Promise) {
        try {
            val file = File(reactApplicationContext.filesDir, BASEKEY_FILENAME)
            if (!file.exists()) {
                promise.reject("BASEKEY_NOT_FOUND", "basekey file not found at: ${file.absolutePath}")
                return
            }
            promise.resolve(file.absolutePath)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting basekey file path", e)
            promise.reject("BASEKEY_ERROR", e.message, e)
        }
    }
}
