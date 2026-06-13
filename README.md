# Agente-Marketing — AI Social Content Automation

An automation agent that **generates marketing content for your products with Claude and delivers it via WhatsApp — on a schedule**. Load your catalog and it writes tailored posts for **Instagram, Facebook and LinkedIn**, then sends them automatically.

## What it does
- **Generates per-product posts** for Instagram / Facebook / LinkedIn — each with its own tone, length and hashtag style — using **Claude**.
- **Sends** the generated posts (and images) via **WhatsApp**.
- **Runs on a schedule** with `node-cron` (set it and forget it).

## AI & automation
- **Content generation:** Claude (`claude-haiku`) via the official Anthropic SDK, with per-network prompt instructions.
- **Delivery:** WhatsApp API.
- **Scheduling:** node-cron.

## Tech stack
`Node.js` · `Anthropic SDK (Claude)` · `WhatsApp API` · `node-cron` · `axios`

## Setup
```bash
npm install
# .env: ANTHROPIC_API_KEY=...  + WhatsApp credentials
npm start
```

> Built by [copidiaz17](https://github.com/copidiaz17) — AI automation & full-stack developer.
