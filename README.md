# 🖤 TheiaOS — The Nervous System

**Voice, intelligence, presence.** TheiaOS is a multi-channel AI gateway — your personal AI's operating system. Built by [Theia AI Systems](https://theiasystems.co.uk).

[![npm version](https://img.shields.io/npm/v/theiaos?style=for-the-badge&color=C3131D)](https://www.npmjs.com/package/theiaos)
[![License](https://img.shields.io/github/license/theia-black/theiaos?style=for-the-badge)](LICENSE)

[Docs](https://docs.theiaos.ai) · [Getting Started](https://docs.theiaos.ai/start/getting-started) · [Vision](VISION.md)

---

## What is TheiaOS?

TheiaOS is a self-hosted AI gateway that connects your AI agent to every messaging channel — iMessage, WhatsApp, Discord, Telegram, Signal, and more — through a single unified system. One brain, many surfaces.

- **Multi-channel messaging** — Send and receive across all platforms from one agent
- **Voice** — Real-time voice conversations with ElevenLabs TTS/STT
- **Skills** — Extensible skill system for tools, automations, and integrations
- **Memory** — Persistent memory with semantic search (markdown + vector DB)
- **Heartbeat** — Proactive autonomous behavior on a schedule
- **Cron** — Scheduled tasks, reminders, and background work
- **Browser** — Full browser automation and control
- **Nodes** — Pair and control remote devices (macOS, iOS, Linux)
- **Sub-agents** — Spawn isolated background workers for parallel tasks

## Quick Start

```bash
# Install globally
pnpm add -g theiaos

# Run setup wizard
theiaos setup

# Start the gateway
theiaos gateway start

# Open the dashboard
open http://localhost:3000
```

## Architecture

```
┌─────────────────────────────────────────────┐
│                  TheiaOS Gateway             │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Channels │  │  Agent   │  │  Skills  │  │
│  │ iMessage │  │  Memory  │  │  Voice   │  │
│  │ WhatsApp │  │  Cron    │  │  Browser │  │
│  │ Discord  │  │  Hooks   │  │  Nodes   │  │
│  │ Telegram │  │          │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

## Configuration

TheiaOS uses a single JSON config file (`~/.theiaos/theiaos.json` or via `THEIAOS_CONFIG_PATH`). Use the CLI to manage it:

```bash
theiaos config get agents
theiaos config set ui.assistant.name "Theia"
theiaos config set ui.seamColor "C3131D"
```

## Skills

Skills extend TheiaOS with new capabilities. Install from the registry or create your own:

```bash
theiaos skills list
theiaos skills install <skill-name>
```

## Documentation

Full documentation: [docs.theiaos.ai](https://docs.theiaos.ai)

## License

[MIT](LICENSE)

---

Built by **Theia AI Systems** — a subsidiary of [Hexus Global Holdings](https://hexus.miami).
