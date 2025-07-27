# Algolia MCP Supermarket Bot

A shopping assistant that actually understands when you say "I want to make pasta" and automatically finds ingredients for you. Built with OpenAI Agents + Algolia MCP integration.

## 🎥 Demo

*Coming soon - need to record a quick demo*

## ✨ What it does

- Chat naturally: "I'm making tacos tonight" → finds tortillas, beef, cheese, etc.
- Weather aware: "It's so hot today!" → suggests ice cream and cold drinks  
- Smart limiting: Shows 1 result per search when doing multiple searches, 4 when single
- Remembers context: 30min conversation memory so you don't repeat yourself
- Secure: Won't leak the system prompt or answer random non-shopping questions

## 🛠 Setup

**You'll need:**
- Node.js 16+
- OpenAI API key
- Algolia account
- [Algolia MCP server](https://github.com/algolia/mcp-node) (download latest release + follow their auth setup)

**Quick start:**
1. Get the [Algolia MCP server](https://github.com/algolia/mcp-node) running first
2. Clone this repo and `npm run setup`
3. Create an Algolia index and import `products.json` (dashboard or CLI)
4. Copy `backend/.env.example` to `backend/.env` and fill in your keys
5. `npm run dev` and you're good to go!

## 🎯 Try it out

```bash
# Start everything
npm run dev

# Test it
curl -X POST http://localhost:4242/api/chat -H "Content-Type: application/json" -d '{"prompt": "I want to make chocolate cake"}'

curl -X POST http://localhost:4242/api/chat -H "Content-Type: application/json" -d '{"prompt": "Its really hot today!"}'
```

## 📡 API

**POST `/api/chat`** - The main endpoint
```json
{"prompt": "I need ingredients for pizza"}
```

**GET `/api/conversations/:sessionId`** - Check conversation status  
**DELETE `/api/conversations/:sessionId`** - End session

## 🤖 How it works

The bot automatically searches when you mention:
- Recipes → finds ingredients
- Weather → suggests appropriate products  
- Meals → finds components
- Direct products → finds alternatives too

Everything gets logged to `./logs/agent-responses.log` for debugging.

## 🔧 Development

```bash
npm run dev         # Both servers
npm run dev:backend # Just the API
npm run logs        # View agent logs
npm run clean       # Clean slate
```

Structure:
```
├── backend/server.js    # Main Express app
├── frontend/           # Next.js (WIP)
├── products.json       # Sample data
└── package.json        # Monorepo scripts
```

## 🏆 Why I built this

I wanted to see if I could make shopping feel more natural than typing keywords into search boxes. The interesting part was getting the AI to proactively search for things without being explicitly asked - like understanding "it's hot today" means you might want cold drinks.

**Cool technical bits:**
- Parses OpenAI Agent responses to extract Algolia results  
- Dynamic result limiting (1 per search when multiple, 4 when single)
- Session memory with automatic cleanup
- Monorepo setup for easy development

Built for the Algolia MCP contest - figured a practical shopping assistant would be more interesting than another generic chatbot.
