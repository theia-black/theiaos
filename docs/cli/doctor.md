---
summary: "CLI reference for `theiaos doctor` (health checks + guided repairs)"
read_when:
  - You have connectivity/auth issues and want guided fixes
  - You updated and want a sanity check
title: "doctor"
---

# `theiaos doctor`

Health checks + quick fixes for the gateway and channels.

Related:

- Troubleshooting: [Troubleshooting](/gateway/troubleshooting)
- Security audit: [Security](/gateway/security)

## Examples

```bash
theiaos doctor
theiaos doctor --repair
theiaos doctor --deep
```

Notes:

- Interactive prompts (like keychain/OAuth fixes) only run when stdin is a TTY and `--non-interactive` is **not** set. Headless runs (cron, Telegram, no terminal) will skip prompts.
- `--fix` (alias for `--repair`) writes a backup to `~/.theiaos/theiaos.json.bak` and drops unknown config keys, listing each removal.

## macOS: `launchctl` env overrides

If you previously ran `launchctl setenv THEIAOS_GATEWAY_TOKEN ...` (or `...PASSWORD`), that value overrides your config file and can cause persistent “unauthorized” errors.

```bash
launchctl getenv THEIAOS_GATEWAY_TOKEN
launchctl getenv THEIAOS_GATEWAY_PASSWORD

launchctl unsetenv THEIAOS_GATEWAY_TOKEN
launchctl unsetenv THEIAOS_GATEWAY_PASSWORD
```
