import Foundation

public enum TheiaOSChatTransportEvent: Sendable {
    case health(ok: Bool)
    case tick
    case chat(TheiaOSChatEventPayload)
    case agent(TheiaOSAgentEventPayload)
    case seqGap
}

public protocol TheiaOSChatTransport: Sendable {
    func requestHistory(sessionKey: String) async throws -> TheiaOSChatHistoryPayload
    func sendMessage(
        sessionKey: String,
        message: String,
        thinking: String,
        idempotencyKey: String,
        attachments: [TheiaOSChatAttachmentPayload]) async throws -> TheiaOSChatSendResponse

    func abortRun(sessionKey: String, runId: String) async throws
    func listSessions(limit: Int?) async throws -> TheiaOSChatSessionsListResponse

    func requestHealth(timeoutMs: Int) async throws -> Bool
    func events() -> AsyncStream<TheiaOSChatTransportEvent>

    func setActiveSessionKey(_ sessionKey: String) async throws
}

extension TheiaOSChatTransport {
    public func setActiveSessionKey(_: String) async throws {}

    public func abortRun(sessionKey _: String, runId _: String) async throws {
        throw NSError(
            domain: "TheiaOSChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "chat.abort not supported by this transport"])
    }

    public func listSessions(limit _: Int?) async throws -> TheiaOSChatSessionsListResponse {
        throw NSError(
            domain: "TheiaOSChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "sessions.list not supported by this transport"])
    }
}
