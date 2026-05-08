# PortfolioAI - AI 作品集工坊

一键生成个人作品集网站。输入自我介绍，AI 自动提取信息，实时预览，支持多种模板和语言。

## 功能

- **AI 智能分析** — 输入一段话，自动提取姓名、专业、技能、项目、工作经历、教育背景、证书
- **三种模板** — 简洁风、多彩风、商务风（Shopify 风格）
- **中英文双语** — 一键切换
- **实时预览** — 左侧编辑，右侧即时预览
- **导出** — 下载独立 HTML 文件 / 导出为图片
- **数据持久化** — 自动保存到浏览器，刷新不丢失

## 技术栈

- 纯前端（HTML/CSS/JS），单页应用
- Node.js 后端代理（转发 AI 请求）
- SiliconFlow API（免费模型 Qwen3-8B）

## 本地运行

```bash
node server.js
# 访问 http://localhost:8080
```

Node.js 18+ 即可，零依赖（使用内置 fetch）。

## 在线 Demo

[https://silencer-dismantle-yoyo.ngrok-free.dev](https://silencer-dismantle-yoyo.ngrok-free.dev)

---

Made by Duck | AI + 策划 + 运营 方向实践作品
