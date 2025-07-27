# Algolia MCP Supermarket Bot

A shopping assistant that actually understands when you say "I want to make pasta" and automatically finds ingredients for you. Built with OpenAI Agents + Algolia MCP integration.

## 🎥 Demo

[![Watch the video](https://img.youtube.com/vi/uFwB4Re9BrQ/maxresdefault.jpg)](https://youtu.be/uFwB4Re9BrQ)

## ✨ What it does

- **Full web interface**: Chat UI running on `localhost:3000` with real-time responses
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
5. `npm run dev` - opens frontend at `http://localhost:3000` and API at `:4242`

## 🎯 Try it out

```bash
# Start both frontend (port 3000) and backend (port 4242)
npm run dev
```

**Web Interface:** Open `http://localhost:3000` for the full chat experience

**API Testing:**
```bash
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

## 🔧 Development

```bash
npm run dev         # Both frontend (:3000) and backend (:4242)
npm run dev:backend # Just the API server
npm run dev:frontend # Just the Next.js frontend
npm run clean       # Clean slate
```

Structure:
```
├── backend/server.js    # Express API server
├── frontend/           # Next.js chat interface
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
