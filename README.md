# Algolia MCP Supermarket Shopping Assistant

An AI-powered supermarket shopping assistant that integrates with Algolia search through Model Context Protocol (MCP). The assistant proactively searches for products based on natural language conversations and provides personalized shopping recommendations.

## 🎥 Demo

<!-- Add a demo GIF or video here -->
*Coming soon: Interactive demo showing natural language shopping conversations*

## 🌟 Features

### Core Functionality
- **Natural Language Shopping**: Chat naturally about recipes, meals, or products
- **Proactive Product Search**: Automatically searches Algolia when products are mentioned
- **Smart Result Limiting**: 1 result per search if multiple searches, 4 results for single searches
- **Recipe Ingredient Detection**: Automatically finds ingredients when discussing recipes
- **Weather-Based Suggestions**: Suggests appropriate products based on weather mentions
- **Conversation Memory**: Maintains context across conversation sessions (30min timeout)

### Technical Features
- **MCP Integration**: Uses Algolia MCP server for seamless product search
- **Session Management**: Persistent conversations with automatic cleanup
- **Comprehensive Logging**: Detailed logging of agent responses and search behavior
- **Security**: Protected system prompt with shopping-focused boundaries
- **CORS Enabled**: Ready for frontend integration

## 🛠 Setup

### Prerequisites
- Node.js (v16 or higher)
- Algolia account with products index
- OpenAI API key
- Algolia MCP server

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd algolia-mcp-supermarket
```

2. Install all dependencies (backend + frontend):
```bash
npm run setup
```

3. Create environment file:
```bash
cd backend
cp .env.example .env
```

4. Configure your `.env` file:
```env
# OpenAI API Configuration
OPENAI_API_KEY="your_openai_api_key_here"

# MCP Server Configuration  
MCP_SERVER_URL="/path/to/your/algolia-mcp-server"

# Algolia Configuration
ALGOLIA_APP_ID="your_algolia_app_id_here"
ALGOLIA_INDEX_NAME="your_algolia_index_name_here"

# Server Configuration (optional)
PORT=4242
```

5. Start the development servers:
```bash
# Start both backend and frontend in development mode
npm run dev

# Or start individually:
npm run dev:backend    # Backend only (Express server)
npm run dev:frontend   # Frontend only (Next.js)
npm run start          # Production backend only
```

## 🎯 Quick Start Commands

```bash
# Initial setup
npm run setup

# Development (both servers)
npm run dev

# Production backend
npm start

# View logs
npm run logs

# Clean install
npm run clean && npm run install:all
```

### Quick Test Examples

Once running, test these conversation examples:

```bash
# Terminal testing with curl
curl -X POST http://localhost:4242/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "I want to make chocolate cake"}'

curl -X POST http://localhost:4242/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Its really hot today!"}'

curl -X POST http://localhost:4242/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What do you have for breakfast?"}'
```

## 📡 API Endpoints

### POST `/api/chat`
Main chat endpoint with conversation memory
```json
{
  "prompt": "I need ingredients for chocolate cake",
  "sessionId": "session_123" // optional
}
```

**Response:**
```json
{
  "message": "Here's what you'll need for a delicious chocolate cake...",
  "products": [...], // Algolia search results
  "totalProducts": 8,
  "sessionId": "session_123",
  "conversationInfo": {
    "messageCount": 1,
    "startTime": 1672531200000
  }
}
```

### POST `/api/search`
Direct product search
```json
{
  "query": "organic milk",
  "filters": "brand:organic" // optional
}
```

### GET `/api/conversations/:sessionId`
Get conversation information

### DELETE `/api/conversations/:sessionId`
End a conversation session

### GET `/api/info`
API information and feature overview

## 🤖 Agent Behavior

The shopping assistant automatically searches for products when users mention:
- **Recipes** → Searches for all ingredients
- **Weather** → Suggests weather-appropriate products (hot→ice cream, cold→soup)
- **Cooking questions** → Finds ingredients and cooking supplies  
- **Health topics** → Suggests relevant healthy foods
- **Meal planning** → Searches for meal components
- **Direct product mentions** → Finds that product and alternatives
- **Occasions/events** → Suggests appropriate products (party→snacks)

## 📊 Logging & Monitoring

All agent responses are logged to `./logs/agent-responses.log` with:
- Timestamp and session information
- User prompts and agent responses
- Algolia search results tracking
- Full agent state for debugging
- Search success/failure indicators

## 🏗 Architecture

### Key Components
- **Agent System**: OpenAI Agents with MCP integration
- **Result Extraction**: Smart parsing of Algolia responses from agent state
- **Session Management**: In-memory conversation storage with cleanup
- **Logging System**: Comprehensive tracking for debugging and monitoring
- **Workspace Management**: Monorepo structure with shared scripts

## 🔧 Development

### Available Scripts
```bash
# Setup and Installation
npm run setup          # Complete project setup
npm run install:all    # Install all dependencies
npm run install:backend # Backend dependencies only
npm run install:frontend # Frontend dependencies only

# Development
npm run dev            # Start both servers in development
npm run dev:backend    # Backend development server only
npm run dev:frontend   # Frontend development server only

# Production
npm start              # Start production backend
npm run build          # Build frontend for production

# Utilities
npm run logs           # View agent response logs
npm run clean          # Clean all node_modules
npm test               # Run all tests
npm run lint           # Lint all code
```

### Project Structure
```
├── package.json           # Root package with workspace scripts
├── backend/
│   ├── server.js         # Main Express server
│   ├── package.json     # Backend dependencies
│   └── .env.example     # Environment template
├── frontend/            # Next.js frontend
│   ├── package.json     # Frontend dependencies
│   └── ...
└── README.md           # This file
```

## 🚀 Deployment

The application is designed to be easily deployable to any Node.js hosting platform. Ensure your MCP server is accessible and all environment variables are properly configured.

## 🏆 Contest Submission

This project demonstrates advanced MCP integration with:
- **Real-world Use Case**: Practical shopping assistant for everyday grocery needs
- **Smart Agent Behavior**: Context-aware product searching that anticipates user needs
- **Technical Excellence**: Robust error handling, comprehensive, and production-ready architecture
- **Scalable Design**: Monorepo structure with professional development workflows
- **User Experience Focus**: Natural conversation flow with intelligent result limiting

### Key Innovation: Proactive Product Discovery
Unlike traditional search interfaces, this assistant proactively identifies shopping opportunities:
- Recipe mentions → Automatic ingredient search
- Weather references → Contextual product suggestions  
- Casual food mentions → Related product discovery
- Smart result limiting based on search complexity

### Technical Highlights
- **Advanced Result Extraction**: Sophisticated parsing of OpenAI Agent responses
- **Dynamic Search Strategy**: 1 result per search when multiple, 4 when single
- **Session Persistence**: Conversation memory with automatic cleanup

**Ready for production deployment with Docker, cloud platforms, and enterprise scaling.**
