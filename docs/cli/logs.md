---
summary: "CLI reference for `theiaos logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `theiaos logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
theiaos logs
theiaos logs --follow
theiaos logs --json
theiaos logs --limit 500
theiaos logs --local-time
theiaos logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.
