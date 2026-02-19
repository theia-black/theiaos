// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "TheiaOSKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "TheiaOSProtocol", targets: ["TheiaOSProtocol"]),
        .library(name: "TheiaOSKit", targets: ["TheiaOSKit"]),
        .library(name: "TheiaOSChatUI", targets: ["TheiaOSChatUI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.0"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "TheiaOSProtocol",
            path: "Sources/TheiaOSProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "TheiaOSKit",
            dependencies: [
                "TheiaOSProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit"),
            ],
            path: "Sources/TheiaOSKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "TheiaOSChatUI",
            dependencies: [
                "TheiaOSKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/TheiaOSChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "TheiaOSKitTests",
            dependencies: ["TheiaOSKit", "TheiaOSChatUI"],
            path: "Tests/TheiaOSKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
