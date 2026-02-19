// swift-tools-version: 6.2
// Package manifest for the TheiaOS macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "TheiaOS",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "TheiaOSIPC", targets: ["TheiaOSIPC"]),
        .library(name: "TheiaOSDiscovery", targets: ["TheiaOSDiscovery"]),
        .executable(name: "TheiaOS", targets: ["TheiaOS"]),
        .executable(name: "theiaos-mac", targets: ["TheiaOSMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/TheiaOSKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "TheiaOSIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "TheiaOSDiscovery",
            dependencies: [
                .product(name: "TheiaOSKit", package: "TheiaOSKit"),
            ],
            path: "Sources/TheiaOSDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "TheiaOS",
            dependencies: [
                "TheiaOSIPC",
                "TheiaOSDiscovery",
                .product(name: "TheiaOSKit", package: "TheiaOSKit"),
                .product(name: "TheiaOSChatUI", package: "TheiaOSKit"),
                .product(name: "TheiaOSProtocol", package: "TheiaOSKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/TheiaOS.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "TheiaOSMacCLI",
            dependencies: [
                "TheiaOSDiscovery",
                .product(name: "TheiaOSKit", package: "TheiaOSKit"),
                .product(name: "TheiaOSProtocol", package: "TheiaOSKit"),
            ],
            path: "Sources/TheiaOSMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "TheiaOSIPCTests",
            dependencies: [
                "TheiaOSIPC",
                "TheiaOS",
                "TheiaOSDiscovery",
                .product(name: "TheiaOSProtocol", package: "TheiaOSKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
