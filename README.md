# 🌳 NAS Claude Code — 24/7 AI Coding Assistant · 24小时AI编程助手

> Deploy Claude Code on your home NAS. Access it from anywhere, anytime — phone or desktop.
>
> 把 Claude Code 部署在家用 NAS 上，全天候运行，手机电脑随时访问。

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Docker%20%7C%20Synology%20%7C%20QNAP%20%7C%20UGREEN-blue)]()

---

## ✨ What & Why · 是什么 & 为什么

**EN** — Ever felt annoyed that Claude Code dies the moment you close your laptop? This project keeps it alive 24/7 on your NAS. With DeepSeek's API (direct connect, no VPN needed for China users), you get:

- 🌐 **Access anywhere** — Open a web page on your phone or any browser
- 🧠 **Shared memory** — Your desktop CC's memories auto-sync to the NAS instance
- 🔗 **Dual CC collaboration** — Desktop CC delegates tasks to NAS CC via MCP bridge
- 🔒 **Container isolation** — Only `/workspace` and `.claude` are mounted; admin folders stay invisible
- 💰 **Nearly free** — Tailscale (free) + Syncthing (free) + DeepSeek API (~$1/mo)

**中文** — 笔记本上的 Claude Code 一关机就掉线？把它搬到家中的 NAS 上，24小时在线：

- 🌐 手机浏览器就能聊天，在外也能用
- 🧠 Windows 本机的记忆自动同步给 NAS
- 🔗 两台 CC 通过 MCP 桥接协作分工
- 🔒 Docker 容器隔离，管理员文件夹完全不可见
- 💰 几乎免费：Tailscale 个人版免费 + Syncthing 免费 + DeepSeek API 几块钱/月

---

## 🏗️ Architecture · 架构

```
┌─────────────────────────────────────────────────┐
│  Any Device (phone / laptop / anywhere)          │
│         │ Tailscale WireGuard tunnel             │
└─────────┼───────────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────────┐
│  Home NAS (Docker)                               │
│                                                  │
│  ┌─ claude-code container (:3000) ────────────┐  │
│  │  • Claude Code v2.1 + DeepSeek API          │  │
│  │  • Web Chat UI (server.js, 0 deps)          │  │
│  │  • tmux persistent session                  │  │
│  └─────────────────────────────────────────────┘  │
│  ┌─ syncthing container (:8384) ───────────────┐  │
│  │  • Syncs .claude/ and memory between devices │  │
│  └─────────────────────────────────────────────┘  │
│  ┌─ Tailscale (system) ────────────────────────┐  │
│  │  • Secure remote tunnel, no open ports       │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
          ↕ MCP bridge (nas_bib_chat tool)
┌─────────────────────────────────────────────────┐
│  Desktop PC (Windows / macOS / Linux)            │
│  • Claude Code (interactive mode)                │
│  • MCP Bridge → auto-delegates to NAS CC         │
│  • SyncTrayzor → Syncthing client                │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start · 快速开始

### Prerequisites · 前提

- A **NAS** that runs Docker (Synology / QNAP / UGREEN / TrueNAS)
- **DeepSeek API Key** → [platform.deepseek.com](https://platform.deepseek.com)
- **Tailscale account** (free) → [tailscale.com](https://tailscale.com)

### 1. Clone · 克隆

```bash
git clone https://github.com/fubob13013-afk/nas-claude-code.git
cd nas-claude-code
```

### 2. Configure · 配置

Edit `docker-compose.yml` and `settings.json`. Replace `你的DeepSeek_API_Key` with your real key.

### 3. Launch · 启动

```bash
mkdir -p workspace claude-config
sudo docker compose up -d --build
```

### 4. Open · 打开

Visit `http://your-nas-ip:3000` in any browser.

### 5. Remote Access (optional) · 远程访问

```bash
curl -fsSL https://tailscale.com/install.sh | sudo sh
sudo tailscale up
```

Then access via your Tailscale IP (`100.x.x.x:3000`) from anywhere.

### 6. Memory Sync (optional) · 记忆同步

See `sync-memory.sh`. Set up Syncthing to sync `.claude/` between your desktop and NAS.

### 7. MCP Bridge (optional) · MCP 桥接

Connect your desktop Claude Code to the NAS instance:

```bash
cd mcp-nas-bridge && npm install
cp .mcp.json ~/.claude/.mcp.json   # edit path inside first
# Restart Claude Code
```

---

## 📁 Files · 文件说明

| File | Purpose |
|------|---------|
| `Dockerfile` | Container build |
| `docker-compose.yml` | One-command deploy (replace API key first) |
| `server.js` | Web chat server — zero dependencies, plain Node.js |
| `settings.json` | Claude Code config template |
| `sync-memory.sh` | Bi-directional memory sync between Windows & NAS CC |
| `.mcp.json` | MCP bridge config (desktop side) |
| `mcp-nas-bridge/` | MCP stdio server — exposes `nas_bib_chat` tool |
| `docs/deploy-guide.md` | Full deployment guide with 18 troubleshooting entries |

---

## ⚠️ Notes · 注意事项

- 🔑 **Never** commit your real API key. All keys in this repo are placeholders.
- 🌐 Tailscale's coordination server is overseas; may occasionally be flaky in China (tested: works).
- 🤖 NAS CC runs in **headless mode** (`claude -p`). Interactive TUI is not supported in Docker with third-party APIs.
- 📦 Docker Hub needs a registry mirror in mainland China (see deploy guide).

---

## 🔧 Key Findings · 关键发现

Full troubleshooting log in [`docs/deploy-guide.md`](docs/deploy-guide.md) (Chinese, 18 entries).

- Claude Code v2.1's interactive mode forces OAuth in Docker → must use headless mode
- Docker Hub blocked in China → use `registry-mirrors`
- Syncthing container needs matching host UID/GID
- Project directory hashes differ between Windows (`C--Users-Administrator`) and Linux (`eab0d61a`)

---

## 📄 License · 许可证

MIT — use, modify, and distribute freely.

---

## ⭐ Support · 支持

If this project helps you, give it a Star ⭐ to help others find it.

Questions? Open an [Issue](https://github.com/fubob13013-afk/nas-claude-code/issues)!
