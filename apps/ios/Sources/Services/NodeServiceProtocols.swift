import CoreLocation
import Foundation
import TheiaOSKit
import UIKit

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: TheiaOSCameraSnapParams) async throws -> (format: String, base64: String, width: Int, height: Int)
    func clip(params: TheiaOSCameraClipParams) async throws -> (format: String, base64: String, durationMs: Int, hasAudio: Bool)
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: TheiaOSLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: TheiaOSLocationGetParams,
        desiredAccuracy: TheiaOSLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    func startLocationUpdates(
        desiredAccuracy: TheiaOSLocationAccuracy,
        significantChangesOnly: Bool) -> AsyncStream<CLLocation>
    func stopLocationUpdates()
    func startMonitoringSignificantLocationChanges(onUpdate: @escaping @Sendable (CLLocation) -> Void)
    func stopMonitoringSignificantLocationChanges()
}

protocol DeviceStatusServicing: Sendable {
    func status() async throws -> TheiaOSDeviceStatusPayload
    func info() -> TheiaOSDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: TheiaOSPhotosLatestParams) async throws -> TheiaOSPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: TheiaOSContactsSearchParams) async throws -> TheiaOSContactsSearchPayload
    func add(params: TheiaOSContactsAddParams) async throws -> TheiaOSContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: TheiaOSCalendarEventsParams) async throws -> TheiaOSCalendarEventsPayload
    func add(params: TheiaOSCalendarAddParams) async throws -> TheiaOSCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: TheiaOSRemindersListParams) async throws -> TheiaOSRemindersListPayload
    func add(params: TheiaOSRemindersAddParams) async throws -> TheiaOSRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: TheiaOSMotionActivityParams) async throws -> TheiaOSMotionActivityPayload
    func pedometer(params: TheiaOSPedometerParams) async throws -> TheiaOSPedometerPayload
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
