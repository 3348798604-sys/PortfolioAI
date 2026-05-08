/**
 * PortfolioAI - 后端代理服务
 *
 * 使用方法：
 * 1. 注册硅基流动 https://cloud.siliconflow.cn（新用户送 2000 万 Token）
 * 2. 将下方 API_KEY 替换为你的硅基流动 API Key
 * 3. 在终端运行：node server.js
 * 4. 访问 http://localhost:8080
 *
 * 零依赖，仅需 Node.js 18+（内置 fetch 支持）
 */

// ====== 配置 ======
const API_KEY = 'sk-bsckzzgtsliepkxjmushitjrzrnsczisruediiyiyigctaeq';  // ← 填入你的硅基流动 API Key
const PORT = 8080;
const API_ENDPOINT = 'https://api.siliconflow.cn/v1/chat/completions';
const MODEL = 'Qwen/Qwen3-8B';

// ====== HTTP 服务 ======
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // CORS（允许本地开发）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ====== API 代理：AI 分析 ======
  if (req.method === 'POST' && req.url === '/api/analyze') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { text } = JSON.parse(body);
        if (!text || !text.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '请输入自我介绍' }));
          return;
        }

        if (!API_KEY || API_KEY === 'YOUR_SILICONFLOW_API_KEY') {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '服务端 API Key 未配置，请联系管理员' }));
          return;
        }

        const systemPrompt = `从用户的自我介绍中提取信息，严格按以下JSON格式返回（不要markdown，不要代码块，只返回JSON文本）：
{"name":"","major":"","bio":"","skills":[],"projects":[]}
规则：
- name: 提取姓名，找不到则返回 null
- major: 提取专业/方向，找不到则返回 null
- bio: 写一句精简的个人简介（可以润色但不要编造）
- skills: 只提取原文提到的技能，没有则[]
- projects: 提取项目，最多3个，没有则[]
- 不要编造原文中没有的信息
- 注意：null 不要加引号，空数组用 []`;

        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + API_KEY
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text }
            ],
            temperature: 0.1,
            max_tokens: 500,
            enable_thinking: false
          })
        });

        if (!response.ok) {
          let errMsg = 'API 错误 ' + response.status;
          try {
            const err = await response.json();
            errMsg = err.error?.message || errMsg;
          } catch (_) {}
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: errMsg }));
          return;
        }

        const data = await response.json();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));

      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ====== 静态文件 ======
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(__dirname, urlPath);

  // 安全检查：禁止访问目录外的文件
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  serveFile(res, filePath);
});

server.listen(PORT, () => {
  console.log('');
  console.log('  PortfolioAI 服务已启动');
  console.log('  ─────────────────────');
  console.log('  本地访问:  http://localhost:' + PORT);
  console.log('  局域网访问: http://' + getLocalIP() + ':' + PORT);
  console.log('');
  console.log('  提示: 按 Ctrl+C 停止服务');
  console.log('');
});

function getLocalIP() {
  const os = require('os');
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}
