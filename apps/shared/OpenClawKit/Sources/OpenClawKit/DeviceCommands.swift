import Foundation

public enum TheiaOSDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum TheiaOSBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum TheiaOSThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum TheiaOSNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum TheiaOSNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct TheiaOSBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: TheiaOSBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: TheiaOSBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct TheiaOSThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: TheiaOSThermalState

    public init(state: TheiaOSThermalState) {
        self.state = state
    }
}

public struct TheiaOSStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct TheiaOSNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: TheiaOSNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [TheiaOSNetworkInterfaceType]

    public init(
        status: TheiaOSNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [TheiaOSNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct TheiaOSDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: TheiaOSBatteryStatusPayload
    public var thermal: TheiaOSThermalStatusPayload
    public var storage: TheiaOSStorageStatusPayload
    public var network: TheiaOSNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: TheiaOSBatteryStatusPayload,
        thermal: TheiaOSThermalStatusPayload,
        storage: TheiaOSStorageStatusPayload,
        network: TheiaOSNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct TheiaOSDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
