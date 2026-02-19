import Foundation

// Stable identifier used for both the macOS LaunchAgent label and Nix-managed defaults suite.
// nix-theiaos writes app defaults into this suite to survive app bundle identifier churn.
let launchdLabel = "ai.theiaos.mac"
let gatewayLaunchdLabel = "ai.theiaos.gateway"
let onboardingVersionKey = "theiaos.onboardingVersion"
let onboardingSeenKey = "theiaos.onboardingSeen"
let currentOnboardingVersion = 7
let pauseDefaultsKey = "theiaos.pauseEnabled"
let iconAnimationsEnabledKey = "theiaos.iconAnimationsEnabled"
let swabbleEnabledKey = "theiaos.swabbleEnabled"
let swabbleTriggersKey = "theiaos.swabbleTriggers"
let voiceWakeTriggerChimeKey = "theiaos.voiceWakeTriggerChime"
let voiceWakeSendChimeKey = "theiaos.voiceWakeSendChime"
let showDockIconKey = "theiaos.showDockIcon"
let defaultVoiceWakeTriggers = ["theiaos"]
let voiceWakeMaxWords = 32
let voiceWakeMaxWordLength = 64
let voiceWakeMicKey = "theiaos.voiceWakeMicID"
let voiceWakeMicNameKey = "theiaos.voiceWakeMicName"
let voiceWakeLocaleKey = "theiaos.voiceWakeLocaleID"
let voiceWakeAdditionalLocalesKey = "theiaos.voiceWakeAdditionalLocaleIDs"
let voicePushToTalkEnabledKey = "theiaos.voicePushToTalkEnabled"
let talkEnabledKey = "theiaos.talkEnabled"
let iconOverrideKey = "theiaos.iconOverride"
let connectionModeKey = "theiaos.connectionMode"
let remoteTargetKey = "theiaos.remoteTarget"
let remoteIdentityKey = "theiaos.remoteIdentity"
let remoteProjectRootKey = "theiaos.remoteProjectRoot"
let remoteCliPathKey = "theiaos.remoteCliPath"
let canvasEnabledKey = "theiaos.canvasEnabled"
let cameraEnabledKey = "theiaos.cameraEnabled"
let systemRunPolicyKey = "theiaos.systemRunPolicy"
let systemRunAllowlistKey = "theiaos.systemRunAllowlist"
let systemRunEnabledKey = "theiaos.systemRunEnabled"
let locationModeKey = "theiaos.locationMode"
let locationPreciseKey = "theiaos.locationPreciseEnabled"
let peekabooBridgeEnabledKey = "theiaos.peekabooBridgeEnabled"
let deepLinkKeyKey = "theiaos.deepLinkKey"
let modelCatalogPathKey = "theiaos.modelCatalogPath"
let modelCatalogReloadKey = "theiaos.modelCatalogReload"
let cliInstallPromptedVersionKey = "theiaos.cliInstallPromptedVersion"
let heartbeatsEnabledKey = "theiaos.heartbeatsEnabled"
let debugPaneEnabledKey = "theiaos.debugPaneEnabled"
let debugFileLogEnabledKey = "theiaos.debug.fileLogEnabled"
let appLogLevelKey = "theiaos.debug.appLogLevel"
let voiceWakeSupported: Bool = ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26
