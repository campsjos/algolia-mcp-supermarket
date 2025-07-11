const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// const algoliasearch = require('algoliasearch');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Algolia client setup
// const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
// const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

// POST endpoint for chat
app.post('/api/chat', async (req, res) => {
    console.log(req);
  const userInput = req.body.input;

  try {
    // Search Algolia index
    // const searchResults = await index.search(userInput);

    // Simulate MCP server response
    const mcpResponse = {
      message: `Processed input: ${userInput}`,
    };

    res.json({
      mcpResponse,
      relatedProducts: [] // searchResults.hits,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
