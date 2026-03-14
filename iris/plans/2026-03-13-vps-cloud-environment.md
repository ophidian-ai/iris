# VPS Cloud Development Environment for OphidianAI

**Status:** Approved (2026-03-13)
**Supersedes:** `iris/plans/2026-03-12-cloud-hosted-iris.md` (Supabase Edge Functions approach)

---

## Context

Eric can only work effectively from his home desktop. When away, he uses Chrome Remote Desktop -- clunky and unreliable. Iris (Claude Code) only runs when the PC is on, meaning automated tasks (morning coffee, follow-ups, outreach) require manual triggering. This plan provisions a cloud VPS that solves both problems: remote development access from anywhere, and 24/7 autonomous Iris.

**This plan supersedes the deferred Supabase Edge Functions plan.** The VPS approach is strictly better: zero reimplementation of skills, full Claude Code capabilities, remote dev access, and only ~$8/mo more than edge functions.

---

## Why VPS Beats Supabase Edge Functions

| Dimension | VPS + Claude Code CLI | Supabase Edge Functions |
|---|---|---|
| Implementation effort | 1 afternoon | 6-8 weeks |
| Skill compatibility | 100% -- runs existing skills as-is | 0% -- every skill must be ported to Deno |
| AI capability | Full Claude Code Max (already paid) | Sonnet via API (~$2/mo extra) |
| Remote dev access | Yes | No |
| Flexibility | Any prompt, any skill, any tool | Only pre-coded workflows |

---

## Architecture

```
                    Eric (anywhere)
                         |
              +---------+---------+
              |                   |
        VS Code Tunnel      SSH (key-only)
        (vscode.dev)        (port 2222)
              |                   |
              +------- VPS -------+
              |  Hetzner CPX31    |
              |  Ubuntu 24.04    |
              |  Ashburn, VA     |
              |                  |
              |  - Claude Code   |
              |  - Node.js 20   |
              |  - GWS CLI      |
              |  - Playwright   |
              |  - Firecrawl    |
              |  - All MCP svrs |
              |                  |
              |  systemd timers: |
              |  07:00 morning   |
              |  09:00 follow-up |
              |  Mon 08:00 outreach |
              |  Fri 16:00 review|
              +------------------+
                    |
          +---------+---------+
          |         |         |
       GitHub   Vercel   Supabase
       (code)   (deploy)  (data)
```

---

## Recommended Setup

- **Provider:** Hetzner Cloud CPX31 -- Ashburn, VA datacenter
- **Specs:** 4 vCPU (dedicated AMD), 8 GB RAM, 160 GB SSD, 3 TB bandwidth
- **OS:** Ubuntu 24.04 LTS
- **Cost:** ~€15.99/mo (~$17.27 USD) + ~€3.20/mo backups (~$3.45 USD) = **~$20.72/mo**
- **Note:** Shared (CX) plans are not available in US locations. CPX (dedicated AMD) is the US tier.
- **Access:** VS Code Remote Tunnels (primary) + SSH

### How VS Code Remote Tunnels Works

This is **full GUI VS Code** -- not a terminal experience. Two access methods:

1. **Local VS Code app (recommended):** Install the "Remote - Tunnels" extension on any machine (laptop, another desktop, etc.). Click connect to your VPS tunnel. Your local VS Code opens with full GUI: file explorer, editor tabs, extensions, integrated terminal, Claude Code sidebar -- identical to what you use today. Files and processes run on the VPS, but the experience is indistinguishable from local development.

2. **Browser fallback (vscode.dev):** Full VS Code GUI in any browser tab. Useful from devices where VS Code isn't installed (phone, tablet, borrowed laptop, Chromebook).

Both methods support the Claude Code VS Code extension. You interact with Claude in the sidebar/panel exactly as you do now on your desktop.

---

## Cost Impact

| Item | Current | After VPS |
|---|---|---|
| Claude Code Max | $100.00 | $100.00 |
| Google Workspace | $7.20 | $7.20 |
| Warmbox Solo | $19.00 | $19.00 |
| Hetzner VPS + backups | -- | ~$20.72 |
| **Total** | **$126.20** | **~$146.92** |

**Net increase: ~$21/mo** for remote access + 24/7 autonomous Iris + 160 GB SSD + dedicated AMD vCPUs.

---

## Implementation Phases

### Phase 1: Provision and Harden (1-2 hours)

Hetzner has a REST API and CLI tool (`hcloud`) that can automate provisioning. Consider scripting server creation, SSH key injection, and firewall rules via CLI instead of the web UI.

1. Create Hetzner Cloud account, provision CPX31 in Ashburn, VA with Ubuntu 24.04
2. Add SSH key during creation
3. SSH in, create `eric` user with sudo
4. Harden SSH:
   - Key-only auth (disable password)
   - Change port to 2222
   - `AllowUsers eric`
5. Install and configure ufw:
   - Default deny incoming
   - Allow 2222/tcp (SSH)
   - Allow 443/tcp (HTTPS, for optional code-server)
6. Install fail2ban (default SSH jail, 3 attempts, 1hr ban)
7. Enable unattended-upgrades for security patches
8. Set timezone: `timedatectl set-timezone America/New_York`
9. Enable Hetzner automated backups ($1.52/mo)

### Phase 2: Development Tools (1-2 hours)

1. Install Node.js 20 LTS via nvm
2. Install Python 3.12 via apt
3. Install build-essential, curl, jq, git
4. Install Playwright + Chromium: `npx playwright install --with-deps chromium`
5. Install GWS CLI
6. Install Firecrawl CLI
7. Install Claude Code CLI: `npm install -g @anthropic/claude-code`

### Phase 3: Repo and Auth (30 min)

1. Generate SSH key on VPS, add to GitHub
2. Clone repo: `git clone git@github.com:<org>/ophidian-ai.git ~/OphidianAI`
3. Init submodules: `git submodule update --init --recursive`
4. Copy `.env` from desktop to VPS via scp
5. Run `gws auth login` -- authenticate GWS CLI
6. Run `claude` -- authenticate Claude Code (copy auth URL to browser)
7. Verify: `claude -p "What is 2+2"` should return an answer

### Phase 4: VS Code Remote Access (30 min)

1. Download VS Code CLI on VPS:
   ```
   curl -fsSL "https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64" -o vscode_cli.tar.gz
   tar xzf vscode_cli.tar.gz
   ```
2. Run `./code tunnel --accept-server-license-terms`
3. Authenticate with GitHub when prompted
4. Register as systemd service: `code tunnel service install`
5. On your local machine (laptop, desktop, etc.):
   - Install VS Code + "Remote - Tunnels" extension
   - Click the remote icon in the bottom-left corner
   - Select "Connect to Tunnel" -- choose your VPS
   - Full GUI VS Code opens with file explorer, extensions, Claude Code sidebar, everything
6. Install extensions through the tunnel (they run on VPS but appear in your local GUI):
   - Claude Code extension
   - Any other extensions you currently use
7. Test from browser too: open `vscode.dev`, connect to tunnel (fallback option)

### Phase 5: Autonomous Iris (1 hour)

Create shell scripts + systemd timers for scheduled Claude Code sessions.

**Script pattern** (`/opt/iris/scripts/morning-coffee.sh`):
```bash
#!/bin/bash
cd /home/eric/OphidianAI
LOG_DIR=/var/log/iris
mkdir -p "$LOG_DIR"
claude -p "/morning-coffee" \
  --allowedTools '*' \
  2>&1 | tee "$LOG_DIR/morning-coffee-$(date +%Y-%m-%d).log"
```

**Systemd timer pattern** (`/etc/systemd/system/iris-morning-coffee.timer`):
```ini
[Unit]
Description=Iris Morning Coffee

[Timer]
OnCalendar=*-*-* 07:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

**Scheduled tasks:**

| Task | Schedule | Skill/Prompt |
|---|---|---|
| Morning coffee | Daily 7:00 AM ET | `/morning-coffee` |
| Follow-up check | Daily 9:00 AM ET | "Check for overdue follow-ups and email summary" |
| Expense scan | Daily 6:00 AM ET | "Scan inbox for receipts and log expenses" |
| Outreach pipeline | Mon 8:00 AM ET | `/outreach-pipeline` |
| Weekly review | Fri 4:00 PM ET | "Generate weekly review and email it" |

### Phase 6: Validate and Cut Over (1 hour)

1. Run `/morning-coffee` from VPS -- verify full pipeline works
2. Send a test email via GWS CLI
3. Take a Playwright screenshot
4. Verify Pinecone, Supabase, Firecrawl connections
5. Confirm all skills function identically to desktop
6. Keep desktop as fallback for 1 week
7. Disable Chrome Remote Desktop

---

## Transition Strategy

- **Weeks 1-2:** Hybrid -- VPS runs autonomous tasks, desktop stays primary for interactive work
- **Weeks 3-4:** VPS-primary -- interactive development moves to VPS via tunnel
- **Long-term:** VPS is the primary machine. Desktop optional for heavy local tasks.

---

## Storage and Growth

- 160 GB SSD included (expect ~15 GB used initially, 145+ GB free)
- Hetzner volumes available at ~€0.052/GB/mo if more storage is needed
- Upgrade path: CPX31 (~$17/mo) -> CPX41 (~$32/mo, 8 vCPU, 16 GB RAM, 240 GB SSD) if load increases
- Git (GitHub) is primary code backup; cloud services (Vercel, Supabase, Google) handle their own data

---

## Files to Update After Migration

- `CLAUDE.md` -- Update any Windows-specific paths to Linux equivalents
- `persistent-memory/tools/gws-cli.md` -- Update credential paths for Linux
- `iris/plans/2026-03-12-cloud-hosted-iris.md` -- Already marked as superseded

---

## Verification

1. SSH into VPS from a non-desktop device (phone hotspot, laptop, etc.)
2. Open VS Code via `vscode.dev` tunnel -- edit a file, run a command
3. Run `claude -p "Run /morning-coffee"` and confirm briefing email arrives
4. Check `systemctl list-timers` -- all Iris timers should be listed and active
5. Wait for one scheduled task to fire, check logs at `/var/log/iris/`
6. Verify git push/pull works from VPS to GitHub
