---
summary: "CLI reference for `theiaos reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `theiaos reset`

Reset local config/state (keeps the CLI installed).

```bash
theiaos reset
theiaos reset --dry-run
theiaos reset --scope config+creds+sessions --yes --non-interactive
```
