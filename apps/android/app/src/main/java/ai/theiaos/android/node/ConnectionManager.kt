package ai.theiaos.android.node

import android.os.Build
import ai.theiaos.android.BuildConfig
import ai.theiaos.android.SecurePrefs
import ai.theiaos.android.gateway.GatewayClientInfo
import ai.theiaos.android.gateway.GatewayConnectOptions
import ai.theiaos.android.gateway.GatewayEndpoint
import ai.theiaos.android.gateway.GatewayTlsParams
import ai.theiaos.android.protocol.TheiaOSCanvasA2UICommand
import ai.theiaos.android.protocol.TheiaOSCanvasCommand
import ai.theiaos.android.protocol.TheiaOSCameraCommand
import ai.theiaos.android.protocol.TheiaOSLocationCommand
import ai.theiaos.android.protocol.TheiaOSScreenCommand
import ai.theiaos.android.protocol.TheiaOSSmsCommand
import ai.theiaos.android.protocol.TheiaOSCapability
import ai.theiaos.android.LocationMode
import ai.theiaos.android.VoiceWakeMode

class ConnectionManager(
  private val prefs: SecurePrefs,
  private val cameraEnabled: () -> Boolean,
  private val locationMode: () -> LocationMode,
  private val voiceWakeMode: () -> VoiceWakeMode,
  private val smsAvailable: () -> Boolean,
  private val hasRecordAudioPermission: () -> Boolean,
  private val manualTls: () -> Boolean,
) {
  companion object {
    internal fun resolveTlsParamsForEndpoint(
      endpoint: GatewayEndpoint,
      storedFingerprint: String?,
      manualTlsEnabled: Boolean,
    ): GatewayTlsParams? {
      val stableId = endpoint.stableId
      val stored = storedFingerprint?.trim().takeIf { !it.isNullOrEmpty() }
      val isManual = stableId.startsWith("manual|")

      if (isManual) {
        if (!manualTlsEnabled) return null
        if (!stored.isNullOrBlank()) {
          return GatewayTlsParams(
            required = true,
            expectedFingerprint = stored,
            allowTOFU = false,
            stableId = stableId,
          )
        }
        return GatewayTlsParams(
          required = true,
          expectedFingerprint = null,
          allowTOFU = false,
          stableId = stableId,
        )
      }

      // Prefer stored pins. Never let discovery-provided TXT override a stored fingerprint.
      if (!stored.isNullOrBlank()) {
        return GatewayTlsParams(
          required = true,
          expectedFingerprint = stored,
          allowTOFU = false,
          stableId = stableId,
        )
      }

      val hinted = endpoint.tlsEnabled || !endpoint.tlsFingerprintSha256.isNullOrBlank()
      if (hinted) {
        // TXT is unauthenticated. Do not treat the advertised fingerprint as authoritative.
        return GatewayTlsParams(
          required = true,
          expectedFingerprint = null,
          allowTOFU = false,
          stableId = stableId,
        )
      }

      return null
    }
  }

  fun buildInvokeCommands(): List<String> =
    buildList {
      add(TheiaOSCanvasCommand.Present.rawValue)
      add(TheiaOSCanvasCommand.Hide.rawValue)
      add(TheiaOSCanvasCommand.Navigate.rawValue)
      add(TheiaOSCanvasCommand.Eval.rawValue)
      add(TheiaOSCanvasCommand.Snapshot.rawValue)
      add(TheiaOSCanvasA2UICommand.Push.rawValue)
      add(TheiaOSCanvasA2UICommand.PushJSONL.rawValue)
      add(TheiaOSCanvasA2UICommand.Reset.rawValue)
      add(TheiaOSScreenCommand.Record.rawValue)
      if (cameraEnabled()) {
        add(TheiaOSCameraCommand.Snap.rawValue)
        add(TheiaOSCameraCommand.Clip.rawValue)
      }
      if (locationMode() != LocationMode.Off) {
        add(TheiaOSLocationCommand.Get.rawValue)
      }
      if (smsAvailable()) {
        add(TheiaOSSmsCommand.Send.rawValue)
      }
      if (BuildConfig.DEBUG) {
        add("debug.logs")
        add("debug.ed25519")
      }
      add("app.update")
    }

  fun buildCapabilities(): List<String> =
    buildList {
      add(TheiaOSCapability.Canvas.rawValue)
      add(TheiaOSCapability.Screen.rawValue)
      if (cameraEnabled()) add(TheiaOSCapability.Camera.rawValue)
      if (smsAvailable()) add(TheiaOSCapability.Sms.rawValue)
      if (voiceWakeMode() != VoiceWakeMode.Off && hasRecordAudioPermission()) {
        add(TheiaOSCapability.VoiceWake.rawValue)
      }
      if (locationMode() != LocationMode.Off) {
        add(TheiaOSCapability.Location.rawValue)
      }
    }

  fun resolvedVersionName(): String {
    val versionName = BuildConfig.VERSION_NAME.trim().ifEmpty { "dev" }
    return if (BuildConfig.DEBUG && !versionName.contains("dev", ignoreCase = true)) {
      "$versionName-dev"
    } else {
      versionName
    }
  }

  fun resolveModelIdentifier(): String? {
    return listOfNotNull(Build.MANUFACTURER, Build.MODEL)
      .joinToString(" ")
      .trim()
      .ifEmpty { null }
  }

  fun buildUserAgent(): String {
    val version = resolvedVersionName()
    val release = Build.VERSION.RELEASE?.trim().orEmpty()
    val releaseLabel = if (release.isEmpty()) "unknown" else release
    return "TheiaOSAndroid/$version (Android $releaseLabel; SDK ${Build.VERSION.SDK_INT})"
  }

  fun buildClientInfo(clientId: String, clientMode: String): GatewayClientInfo {
    return GatewayClientInfo(
      id = clientId,
      displayName = prefs.displayName.value,
      version = resolvedVersionName(),
      platform = "android",
      mode = clientMode,
      instanceId = prefs.instanceId.value,
      deviceFamily = "Android",
      modelIdentifier = resolveModelIdentifier(),
    )
  }

  fun buildNodeConnectOptions(): GatewayConnectOptions {
    return GatewayConnectOptions(
      role = "node",
      scopes = emptyList(),
      caps = buildCapabilities(),
      commands = buildInvokeCommands(),
      permissions = emptyMap(),
      client = buildClientInfo(clientId = "theiaos-android", clientMode = "node"),
      userAgent = buildUserAgent(),
    )
  }

  fun buildOperatorConnectOptions(): GatewayConnectOptions {
    return GatewayConnectOptions(
      role = "operator",
      scopes = listOf("operator.read", "operator.write", "operator.talk.secrets"),
      caps = emptyList(),
      commands = emptyList(),
      permissions = emptyMap(),
      client = buildClientInfo(clientId = "theiaos-control-ui", clientMode = "ui"),
      userAgent = buildUserAgent(),
    )
  }

  fun resolveTlsParams(endpoint: GatewayEndpoint): GatewayTlsParams? {
    val stored = prefs.loadGatewayTlsFingerprint(endpoint.stableId)
    return resolveTlsParamsForEndpoint(endpoint, storedFingerprint = stored, manualTlsEnabled = manualTls())
  }
}
