#!/bin/bash
# 记忆同步脚本 — 在 Windows 项目目录和 NAS 项目目录间双向复制记忆文件
# 用法：在 NAS 宿主机上运行（非容器内）
#       bash sync-memory.sh

# 修改为你的实际路径
# Windows CC 记忆目录（通过 Syncthing 同步到 NAS 后的路径）
SRC="/你的路径/claude-config/projects/C--Users-Administrator/memory"
# NAS CC 记忆目录（容器项目 hash，见文档说明）
DST="/你的路径/claude-config/projects/eab0d61a/memory"

mkdir -p "$SRC" "$DST"

# 双向复制（跳过 MEMORY.md 自身）
for f in "$SRC"/*.md; do
  [ -f "$f" ] || continue
  bn=$(basename "$f")
  [ "$bn" = "MEMORY.md" ] && continue
  [ -f "$DST/$bn" ] || cp "$f" "$DST/"
done

for f in "$DST"/*.md; do
  [ -f "$f" ] || continue
  bn=$(basename "$f")
  [ "$bn" = "MEMORY.md" ] && continue
  [ -f "$SRC/$bn" ] || cp "$f" "$SRC/"
done

# 重建 MEMORY.md 索引
{
  echo "# Shared Memory Index"
  echo ""
  for f in "$SRC"/*.md "$DST"/*.md; do
    [ -f "$f" ] || continue
    bn=$(basename "$f")
    [ "$bn" = "MEMORY.md" ] && continue
    title=$(grep '^name:' "$f" | head -1 | sed 's/^name: *//')
    [ -z "$title" ] && title="$bn"
    echo "- [$title]($bn)"
  done | sort -u
} > "$SRC/MEMORY.md"
cp "$SRC/MEMORY.md" "$DST/MEMORY.md"

echo "记忆同步完成"
