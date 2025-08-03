package com.giachan2002.encryptsim

import android.net.VpnService
import com.facebook.react.bridge.*
import com.wireguard.android.backend.GoBackend
import com.wireguard.android.backend.Tunnel
import com.wireguard.config.Config
import java.util.concurrent.Executors
import java.io.StringReader
import java.io.BufferedReader

class WireGuardVpnModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "WireGuardVpnModule"
    }

    private val executor = Executors.newSingleThreadExecutor()
    private var backend: GoBackend? = null
    private var tunnel: Tunnel? = null
    private var isConnected = false

    override fun getName(): String = NAME

    @ReactMethod
    fun initialize(promise: Promise) {
        try {
            backend = GoBackend(reactApplicationContext)
            promise.resolve(true)
        } catch (error: Exception) {
            promise.reject("INIT_ERROR", "Failed to initialize WireGuard VPN module", error)
        }
    }

    @ReactMethod
    fun isSupported(promise: Promise) {
        try {
            val isSupported = VpnService.prepare(reactApplicationContext) == null
            promise.resolve(isSupported)
        } catch (error: Exception) {
            promise.reject("SUPPORT_CHECK_ERROR", "Error checking WireGuard support", error)
        }
    }

    // Pass the full config file as a string under the key "config"
    @ReactMethod
    fun connect(configMap: ReadableMap, promise: Promise) {
        executor.execute {
            try {
                val configString = configMap.getString("config")
                    ?: throw IllegalArgumentException("Missing 'config' parameter")
                val reader = BufferedReader(StringReader(configString))
                val config = Config.parse(reader)

                tunnel = object : Tunnel {
                    override fun getName() = "WireGuardVPN"
                    override fun onStateChange(state: Tunnel.State) {}
                }
                backend?.setState(tunnel, Tunnel.State.UP, config)
                isConnected = true
                promise.resolve(true)
            } catch (error: Exception) {
                promise.reject("CONNECTION_ERROR", "Error connecting to WireGuard VPN: ${error.message}", error)
            }
        }
    }

    @ReactMethod
    fun disconnect(promise: Promise) {
        executor.execute {
            try {
                tunnel?.let { backend?.setState(it, Tunnel.State.DOWN, null) }
                isConnected = false
                promise.resolve(true)
            } catch (error: Exception) {
                promise.reject("DISCONNECTION_ERROR", "Error disconnecting from WireGuard VPN", error)
            }
        }
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        executor.execute {
            try {
                promise.resolve(if (isConnected) "connected" else "disconnected")
            } catch (error: Exception) {
                promise.reject("STATUS_ERROR", "Error getting WireGuard VPN status", error)
            }
        }
    }
}
