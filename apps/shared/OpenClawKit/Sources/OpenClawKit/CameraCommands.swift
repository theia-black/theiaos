import Foundation

public enum TheiaOSCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum TheiaOSCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum TheiaOSCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum TheiaOSCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct TheiaOSCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: TheiaOSCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: TheiaOSCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: TheiaOSCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: TheiaOSCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct TheiaOSCameraClipParams: Codable, Sendable, Equatable {
    public var facing: TheiaOSCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: TheiaOSCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: TheiaOSCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: TheiaOSCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
