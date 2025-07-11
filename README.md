# Algolia MCP Supermarket Chatbot Backend

This is a Node.js backend for a supermarket chatbot that integrates with Algolia MCP.

## Features
- POST endpoint at `/api/chat` to process user input.
- Fetches context and related products from Algolia.
- Uses `dotenv` for environment variables.
- CORS enabled for frontend integration.

## Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file with the following variables:
   - `ALGOLIA_APP_ID`
   - `ALGOLIA_API_KEY`
   - `ALGOLIA_INDEX_NAME`
4. Start the server with `node server.js`.

## Usage
- Send a POST request to `/api/chat` with a JSON body containing `input`.
- Example:
```json
{
  "input": "milk"
}
```

## Dependencies
- `express`
- `dotenv`
- `cors`
- `algoliasearch`
