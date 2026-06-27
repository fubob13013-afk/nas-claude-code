const http = require('http');
const { exec } = require('child_process');

const PORT = 3000;

const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bib · NAS</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,system-ui,sans-serif;background:#1a1a2e;color:#e0e0e0;height:100vh;display:flex;flex-direction:column}
.header{background:#16213e;padding:12px 16px;text-align:center;font-size:14px;color:#7ec8a0;border-bottom:1px solid #0f3460}
.chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.6;white-space:pre-wrap;word-break:break-word}
.msg.user{align-self:flex-end;background:#0f3460;color:#e0e0e0}
.msg.bot{align-self:flex-start;background:#16213e;color:#c0c0c0;border:1px solid #0f3460}
.input-area{display:flex;padding:12px;gap:8px;background:#16213e;border-top:1px solid #0f3460}
.input-area input{flex:1;padding:10px 14px;border:1px solid #0f3460;border-radius:20px;background:#1a1a2e;color:#e0e0e0;font-size:14px;outline:none}
.input-area button{width:44px;height:44px;border:none;border-radius:50%;background:#7ec8a0;color:#1a1a2e;font-size:18px;cursor:pointer}
.loading{color:#7ec8a0;font-size:12px;text-align:center}
</style>
</head>
<body>
<div class="header">🌳 Bib · NAS版（DeepSeek）</div>
<div class="chat" id="chat"></div>
<div class="input-area">
  <input id="input" placeholder="输入消息..." autofocus>
  <button onclick="send()">▶</button>
</div>
<script>
const chat=document.getElementById("chat"),input=document.getElementById("input");
async function send(){
  const msg=input.value.trim();
  if(!msg)return;
  addMsg(msg,"user");
  input.value="";
  const load=addMsg("思考中...","bot","loading");
  try{
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg})});
    const d=await r.json();
    load.remove();
    addMsg(d.reply||d.error||"无响应","bot");
  }catch(e){
    load.remove();
    addMsg("连接失败: "+e.message,"bot");
  }
}
function addMsg(text,role,cls){
  const d=document.createElement("div");
  d.className="msg "+role+(cls?" "+cls:"");
  d.textContent=text;
  chat.appendChild(d);
  chat.scrollTop=chat.scrollHeight;
  return d;
}
input.addEventListener("keydown",e=>{if(e.key==="Enter")send()});
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
  } else if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { message } = JSON.parse(body);
        if (!message) throw new Error('empty');
        const cmd = 'claude -p ' + JSON.stringify(message) + ' --model deepseek-v4-pro';
        exec(cmd, { timeout: 180000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
          if (err && !stdout) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: stderr || err.message }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ reply: stdout.trim() }));
          }
        });
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'bad request' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('404');
  }
});

server.listen(PORT, () => console.log('Bib Web running on port ' + PORT));
