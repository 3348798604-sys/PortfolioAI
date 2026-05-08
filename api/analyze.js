const API_KEY = process.env.API_KEY;
const API_ENDPOINT = 'https://api.siliconflow.cn/v1/chat/completions';
const MODEL = 'Qwen/Qwen3-8B';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: '仅支持 POST' });
    return;
  }

  try {
    const { text } = req.body || {};
    if (!text || !text.trim()) {
      res.status(400).json({ error: '请输入自我介绍' });
      return;
    }

    if (!API_KEY) {
      res.status(500).json({ error: 'API Key 未配置' });
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
      res.status(500).json({ error: errMsg });
      return;
    }

    const data = await response.json();
    res.json(data);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
