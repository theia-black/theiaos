---
summary: "CLI reference for `theiaos agents` (list/add/delete/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
title: "agents"
---

# `theiaos agents`

Manage isolated agents (workspaces + auth + routing).

Related:

- Multi-agent routing: [Multi-Agent Routing](/concepts/multi-agent)
- Agent workspace: [Agent workspace](/concepts/agent-workspace)

## Examples

```bash
theiaos agents list
theiaos agents add work --workspace ~/.theiaos/workspace-work
theiaos agents set-identity --workspace ~/.theiaos/workspace --from-identity
theiaos agents set-identity --agent main --avatar avatars/theiaos.png
theiaos agents delete work
```

## Identity files

Each agent workspace can include an `IDENTITY.md` at the workspace root:

- Example path: `~/.theiaos/workspace/IDENTITY.md`
- `set-identity --from-identity` reads from the workspace root (or an explicit `--identity-file`)

Avatar paths resolve relative to the workspace root.

## Set identity

`set-identity` writes fields into `agents.list[].identity`:

- `name`
- `theme`
- `emoji`
- `avatar` (workspace-relative path, http(s) URL, or data URI)

Load from `IDENTITY.md`:

```bash
theiaos agents set-identity --workspace ~/.theiaos/workspace --from-identity
```

Override fields explicitly:

```bash
theiaos agents set-identity --agent main --name "TheiaOS" --emoji "🦞" --avatar avatars/theiaos.png
```

Config sample:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "TheiaOS",
          theme: "space lobster",
          emoji: "🦞",
          avatar: "avatars/theiaos.png",
        },
      },
    ],
  },
}
```
