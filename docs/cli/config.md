---
summary: "CLI reference for `theiaos config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `theiaos config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `theiaos configure`).

## Examples

```bash
theiaos config get browser.executablePath
theiaos config set browser.executablePath "/usr/bin/google-chrome"
theiaos config set agents.defaults.heartbeat.every "2h"
theiaos config set agents.list[0].tools.exec.node "node-id-or-name"
theiaos config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
theiaos config get agents.defaults.workspace
theiaos config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
theiaos config get agents.list
theiaos config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--json` to require JSON5 parsing.

```bash
theiaos config set agents.defaults.heartbeat.every "0m"
theiaos config set gateway.port 19001 --json
theiaos config set channels.whatsapp.groups '["*"]' --json
```

Restart the gateway after edits.
