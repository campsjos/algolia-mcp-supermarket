/* express-mcp-chat/index.js */
import express from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Agent, run, MCPServerStreamableHttp, hostedMcpTool, MCPServerStdio } from '@openai/agents';
import fs from 'fs';

dotenv.config();

// === Configuration ===
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// === Initialize OpenAI client ===
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// === Initialize Express app ===
const app = express();
app.use(bodyParser.json());

// === Enable CORS for frontend integration ===
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// === Setup MCP Server ===
const algoliaMcpServer = new MCPServerStdio({
  command: process.env.MCP_SERVER_URL,
  name: 'algolia-mcp'
});

// === Initialize Agent (will be connected in startServer) ===
let agent;

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

// === API Info endpoint ===
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Supermarket Shopping Assistant API',
    version: '1.0.0',
    description: 'AI-powered shopping assistant with Algolia search integration',
    endpoints: {
      '/api/chat': 'POST - Chat with the shopping assistant',
      '/api/search': 'POST - Search for products directly',
      '/api/info': 'GET - API information'
    },
    features: [
      'Natural language product search',
      'Shopping recommendations',
      'Product information and availability',
      'Algolia-powered search results'
    ]
  });
});

// === /api/chat endpoint ===
app.post('/api/chat', async (req, res) => {
  try {
    if (!agent) {
      return res.status(503).json({ error: 'Shopping assistant is not ready yet. Please try again in a moment.' });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'A prompt is required.' });
    }

    console.log('Received prompt:', prompt);
    
    // Run the agent with the user prompt
    const result = await run(
      agent,  
      prompt
    );

    const output = result.finalOutput;
    console.log('Agent response:', output);
    let hits = [];

    result.state._generatedItems.forEach(element => {
      if (element.type === 'tool_call_output_item') {
        let text = JSON.parse(element.rawItem.output.text);
        text = JSON.parse(text.text);
        hits = text.hits || [];
      }
    });

    // Return response with both the agent's message and Algolia results
    res.json({ 
      response: output,
      products: hits,
      totalProducts: hits.length
    });
  } catch (err) {
    console.error('Error processing query:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// === /api/search endpoint for direct product search ===
app.post('/api/search', async (req, res) => {
  try {
    if (!agent) {
      return res.status(503).json({ error: 'Shopping assistant is not ready yet. Please try again in a moment.' });
    }

    const { query, filters } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'A search query is required.' });
    }

    console.log('Product search query:', query);
    
    // Create a search prompt for the agent
    const searchPrompt = `Search for products related to: "${query}"${filters ? ` with filters: ${filters}` : ''}. Please provide a list of relevant products.`;
    
    const result = await run(agent, searchPrompt);
    
    console.log('Search result structure:', JSON.stringify(result, null, 2));
    
    // Extract Algolia search results using helper function
    let products = extractAlgoliaResults(result);
    console.log("Extracted search products:", products);

    res.json({
      query,
      products,
      totalProducts: products.length,
      message: result.finalOutput
    });
  } catch (err) {
    console.error('Error processing search:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// === Helper function to extract Algolia results ===
function extractAlgoliaResults(result) {
  let algloliaResults = [];
  
  // Function to recursively search for Algolia data in any object
  function searchForAlgoliaData(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    // Check if this object has hits array (typical Algolia response)
    if (obj.hits && Array.isArray(obj.hits)) {
      algloliaResults.push(...obj.hits);
      return;
    }
    
    // Recursively search in all properties
    Object.values(obj).forEach(value => {
      if (typeof value === 'object') {
        searchForAlgoliaData(value);
      }
    });
  }
  
  // Search in different possible locations
  const searchLocations = [
    result.toolCalls,
    result.tool_calls,
    result.steps,
    result.data,
    result.results,
    result
  ];
  
  searchLocations.forEach(location => {
    if (location) {
      searchForAlgoliaData(location);
    }
  });
  
  return algloliaResults;
}

// === Validation middleware ===
const validateApiKey = (req, res, next) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' 
    });
  }
  next();
};

// === Apply validation to API routes ===
app.use('/api', validateApiKey);

// === Startup ===
const startServer = async () => {
  try {
    // Connect to MCP server and initialize agent
    console.log('Connecting to Algolia MCP server...');
    await algoliaMcpServer.connect();
    console.log('✅ Algolia MCP server connected successfully');
    
    // Initialize agent after MCP connection
    agent = new Agent({
      name: 'SupermarketShoppingAssistant',
      instructions: `You are a helpful supermarket shopping assistant. Your role is to:
      1. Help customers find products they're looking for
      2. Provide product recommendations and suggestions  
      3. Answer questions about products, prices, and availability
      4. Use Algolia search to find relevant products when needed
      
      When a user asks about products or shopping, always search Algolia for relevant results.
      Be friendly, helpful, and conversational in your responses.
      Focus on providing useful shopping advice and product information.`,
      mcpServers: [algoliaMcpServer]
    });
    
    console.log('✅ Shopping assistant agent initialized');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Supermarket Shopping Assistant API listening on port ${PORT}`);
      console.log(`📍 API endpoints:`);
      console.log(`   - GET  /api/info - API information`);
      console.log(`   - POST /api/chat - Chat with shopping assistant`);
      console.log(`   - POST /api/search - Direct product search`);
      console.log(`🛒 Ready to help customers with their shopping needs!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();