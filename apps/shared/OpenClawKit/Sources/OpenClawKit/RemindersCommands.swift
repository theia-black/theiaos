import Foundation

public enum TheiaOSRemindersCommand: String, Codable, Sendable {
    case list = "reminders.list"
    case add = "reminders.add"
}

public enum TheiaOSReminderStatusFilter: String, Codable, Sendable {
    case incomplete
    case completed
    case all
}

public struct TheiaOSRemindersListParams: Codable, Sendable, Equatable {
    public var status: TheiaOSReminderStatusFilter?
    public var limit: Int?

    public init(status: TheiaOSReminderStatusFilter? = nil, limit: Int? = nil) {
        self.status = status
        self.limit = limit
    }
}

public struct TheiaOSRemindersAddParams: Codable, Sendable, Equatable {
    public var title: String
    public var dueISO: String?
    public var notes: String?
    public var listId: String?
    public var listName: String?

    public init(
        title: String,
        dueISO: String? = nil,
        notes: String? = nil,
        listId: String? = nil,
        listName: String? = nil)
    {
        self.title = title
        self.dueISO = dueISO
        self.notes = notes
        self.listId = listId
        self.listName = listName
    }
}

public struct TheiaOSReminderPayload: Codable, Sendable, Equatable {
    public var identifier: String
    public var title: String
    public var dueISO: String?
    public var completed: Bool
    public var listName: String?

    public init(
        identifier: String,
        title: String,
        dueISO: String? = nil,
        completed: Bool,
        listName: String? = nil)
    {
        self.identifier = identifier
        self.title = title
        self.dueISO = dueISO
        self.completed = completed
        self.listName = listName
    }
}

public struct TheiaOSRemindersListPayload: Codable, Sendable, Equatable {
    public var reminders: [TheiaOSReminderPayload]

    public init(reminders: [TheiaOSReminderPayload]) {
        self.reminders = reminders
    }
}

public struct TheiaOSRemindersAddPayload: Codable, Sendable, Equatable {
    public var reminder: TheiaOSReminderPayload

    public init(reminder: TheiaOSReminderPayload) {
        self.reminder = reminder
    }
}
