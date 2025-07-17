package com.giachan2002.encryptsim

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.ReactPackage
import com.facebook.react.TurboReactPackage
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

@ReactModule(name = VpnPermissionModule.NAME)
class VpnPermissionModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val NAME = "VpnPermission"
        const val VPN_REQUEST_CODE = 1001
    }

    private var permissionPromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun requestVpnPermission(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No activity available")
            return
        }

        val intent = VpnService.prepare(activity)
        if (intent != null) {
            permissionPromise = promise
            activity.startActivityForResult(intent, VPN_REQUEST_CODE)
        } else {
            // Already granted
            promise.resolve(true)
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == VPN_REQUEST_CODE && permissionPromise != null) {
            if (resultCode == Activity.RESULT_OK) {
                permissionPromise?.resolve(true)
            } else {
                permissionPromise?.reject("VPN_PERMISSION_DENIED", "User denied VPN permission")
            }
            permissionPromise = null
        }
    }

    override fun onNewIntent(intent: Intent?) {}
}

class VpnPermissionPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<ReactContextBaseJavaModule> {
        return listOf(VpnPermissionModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<com.facebook.react.uimanager.ViewManager<*, *>> {
        return emptyList()
    }
}
