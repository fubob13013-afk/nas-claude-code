FROM node:18-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends tmux git curl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install -g @anthropic-ai/claude-code
RUN useradd -m -s /bin/bash ccuser
COPY server.js /home/ccuser/server.js
RUN chown ccuser:ccuser /home/ccuser/server.js
USER ccuser
WORKDIR /workspace
EXPOSE 3000
CMD ["/bin/bash", "-c", "tmux new-session -d -s cc && node /home/ccuser/server.js"]
