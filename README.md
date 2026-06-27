# 🌳 NAS Claude Code — 24/7 AI 编程助手

> 把 Claude Code 部署在家用 NAS 上，全天候运行，手机电脑随时访问。

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ 这是什么

你是否有过这样的体验：笔记本上的 Claude Code 很好用，但一关电脑它就「死」了？

这个项目让你把 Claude Code 部署在家里的 **NAS** 上（群晖/威联通/绿联都行），配合 **DeepSeek API**（国内直连，无需科学上网），实现：

- 🌐 **随时随地访问**：手机浏览器打开网页就能聊天
- 🧠 **记忆共享**：Windows 本机 CC 的记忆自动同步给 NAS CC
- 🔗 **双 CC 协作**：Windows CC 通过 MCP 直接委派任务给 NAS CC
- 🔒 **容器隔离**：只访问指定目录，NAS 上其他文件绝对安全
- 💰 **近乎免费**：Tailscale 免费、Syncthing 免费、DeepSeek API 按量计费（几块钱/月）

## 🏗️ 架构

```
手机/电脑 (任意地点)
    │ Tailscale 加密隧道
    ▼
NAS (Docker)
  ├── claude-code 容器 (:3000)
  │   ├── Claude Code v2.1 + DeepSeek API
  │   ├── Web 聊天界面 (server.js)
  │   └── tmux 持久化会话
  ├── syncthing 容器 (:8384)
  │   └── 同步 .claude 和记忆文件
  └── Tailscale (系统)
      └── NAS IP: 100.x.x.x

Windows PC
  ├── Claude Code (交互模式)
  ├── MCP 桥接 → 自动调用 NAS CC
  └── SyncTrayzor → Syncthing 客户端
```

## 🚀 快速开始

### 前提条件

- 一台 **NAS**（群晖/威联通/绿联，能跑 Docker 就行）
- **DeepSeek API Key**：[platform.deepseek.com](https://platform.deepseek.com) 注册获取
- **Tailscale 账号**（免费）：[tailscale.com](https://tailscale.com)

### 1. 克隆仓库到 NAS

```bash
git clone https://github.com/你的用户名/nas-claude-code.git
cd nas-claude-code
```

### 2. 配置 API Key

编辑 `docker-compose.yml` 和 `settings.json`，把 `你的DeepSeek_API_Key` 替换为你的真实 Key。

### 3. 启动服务

```bash
# 创建必要目录
mkdir -p workspace claude-config

# 构建并启动
sudo docker compose up -d --build
```

### 4. 访问

浏览器打开 `http://你的NAS_IP:3000`

### 5. 配置远程访问（可选）

```bash
# 安装 Tailscale
curl -fsSL https://tailscale.com/install.sh | sudo sh
sudo tailscale up
```

之后用手机/电脑的 Tailscale IP 即可远程访问。

### 6. 配置记忆同步（可选）

参考 `sync-memory.sh`，搭配 Syncthing 实现 Windows 和 NAS 的记忆双向同步。

### 7. 配置 MCP 桥接（可选）

将本机 Claude Code 和 NAS CC 连接，让 Windows CC 能直接派任务给 NAS：

1. 进入 `mcp-nas-bridge/` 目录：`npm install`
2. 复制 `.mcp.json` 到 `~/.claude/.mcp.json`，修改路径
3. 重启 Claude Code

## 📁 文件说明

| 文件 | 用途 |
|------|------|
| `Dockerfile` | 容器构建文件 |
| `docker-compose.yml` | 一键部署配置 |
| `server.js` | Web 聊天服务器（零依赖） |
| `settings.json` | Claude Code 配置模板 |
| `sync-memory.sh` | 记忆同步脚本 |
| `.mcp.json` | MCP 桥接配置文件 |
| `mcp-nas-bridge/` | MCP 桥接代码（Node.js） |
| `docs/` | 完整部署文档 |

## ⚠️ 注意事项

- **不要**把你的真实 API Key 提交到 GitHub。本项目所有配置文件中 Key 已替换为占位符
- Tailscale 的协调服务器在海外，偶尔可能不稳定（国内实测可用）
- NAS CC 运行在 **headless 模式**（`claude -p`），不支持交互式 TUI

## 🔧 踩坑经验

完整的踩坑记录和解决方案见 [`docs/NAS-ClaudeCode-部署文档.md`](docs/NAS-ClaudeCode-部署文档.md)。

关键发现：
- Claude Code v2.1 的交互模式在 Docker 中强制 OAuth，必须用 headless 模式
- Docker Hub 国内需要配镜像加速
- Syncthing 容器需要匹配宿主机的 UID/GID
- 项目目录 hash 在 Windows 和 Linux 上不同，记忆同步需要处理

## 📄 许可证

MIT License — 随意使用、修改、分发。

## ⭐ 支持

如果这个项目对你有用，给个 Star ⭐ 让更多人看到。

有问题欢迎提 [Issue](https://github.com/你的用户名/nas-claude-code/issues)！
